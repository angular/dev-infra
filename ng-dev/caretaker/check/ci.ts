/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ActiveReleaseTrains,
  getNextBranchName,
  ReleaseRepoWithApi,
  ReleaseTrain,
} from '../../release/versioning/index.js';

import {bold, Log} from '../../utils/logging.js';
import {BaseModule} from './base.js';

/** The result of checking a branch on CI. */
type CiBranchStatus = 'pending' | 'passing' | 'failing' | null;

/** A list of results for checking CI branches. */
type CiData = {
  active: boolean;
  name: string;
  label: string;
  status: CiBranchStatus;
}[];

export class CiModule extends BaseModule<CiData> {
  override async retrieveData() {
    const nextBranchName = getNextBranchName(this.config.github);
    const repo: ReleaseRepoWithApi = {
      api: this.git.github,
      ...this.git.remoteConfig,
      nextBranchName,
    };
    const {latest, next, releaseCandidate, exceptionalMinor} =
      await ActiveReleaseTrains.fetch(repo);
    const ciResultPromises = Object.entries({releaseCandidate, exceptionalMinor, latest, next}).map(
      async ([trainName, train]: [string, ReleaseTrain | null]) => {
        if (train === null) {
          return {
            active: false,
            name: trainName,
            label: '',
            status: null,
          };
        }

        return {
          active: true,
          name: train.branchName,
          label: `${trainName} (${train.branchName})`,
          status: (
            await this.git.github.getCombinedChecksAndStatusesForRef({
              ...this.git.remoteParams,
              ref: train.branchName,
            })
          ).result,
        };
      },
    );

    return await Promise.all(ciResultPromises);
  }

  override async printToTerminal() {
    const data = await this.data;
    const minLabelLength = Math.max(...data.map((result) => result.label.length));
    Log.info.group(bold(`CI`));
    data.forEach((result) => {
      if (result.active === false) {
        Log.debug(`No active release train for ${result.name}`);
        return;
      }
      const label = result.label.padEnd(minLabelLength);
      if (result.status === null) {
        Log.info(`${result.name} branch was not found on CI`);
      } else if (result.status === 'passing') {
        Log.info(`${label} ✅`);
      } else if (result.status === 'pending') {
        Log.info(`${label} 🟡`);
      } else {
        Log.info(`${label} ❌`);
      }
    });
    Log.info.groupEnd();
    Log.info();
  }
}
