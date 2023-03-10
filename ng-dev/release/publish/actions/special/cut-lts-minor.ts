/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';
import {Log} from '../../../../utils/logging.js';
import {Prompt} from '../../../../utils/prompt.js';

import {ActiveReleaseTrains} from '../../../versioning/active-release-trains.js';
import {getLtsNpmDistTagOfMajor} from '../../../versioning/long-term-support.js';
import {
  convertVersionBranchToSemVer,
  isVersionBranch,
} from '../../../versioning/version-branches.js';
import {FatalReleaseActionError} from '../../actions-error.js';
import {ReleaseAction} from '../../actions.js';

/**
 * SPECIAL: Action should only be used by dev-infra members.
 *
 * Release action that cuts a new minor for an LTS major. The new LTS
 * minor branch is required to be created beforehand.
 */
export class SpecialCutLongTermSupportMinorAction extends ReleaseAction {
  override async getDescription() {
    return `SPECIAL: Cut a new release for an LTS minor.`;
  }

  override async perform() {
    const ltsBranch = await this._askForVersionBranch('Please specify the target LTS branch:');
    const compareVersionForReleaseNotes = semver.parse(
      await Prompt.input('Compare version for release'),
    )!;

    const newVersion = semver.parse(
      `${ltsBranch.branchVersion.major}.${ltsBranch.branchVersion.minor}.0`,
    )!;

    const {pullRequest, releaseNotes, builtPackagesWithInfo, beforeStagingSha} =
      await this.checkoutBranchAndStageVersion(
        newVersion,
        compareVersionForReleaseNotes,
        ltsBranch.branch,
      );

    await this.promptAndWaitForPullRequestMerged(pullRequest);
    await this.publish(
      builtPackagesWithInfo,
      releaseNotes,
      beforeStagingSha,
      ltsBranch.branch,
      getLtsNpmDistTagOfMajor(newVersion.major),
    );
    await this.cherryPickChangelogIntoNextBranch(releaseNotes, ltsBranch.branch);
  }

  private async _askForVersionBranch(message: string): Promise<{
    branch: string;
    branchVersion: semver.SemVer;
  }> {
    const branch = await Prompt.input(message);
    if (!isVersionBranch(branch)) {
      Log.error('Invalid release branch specified.');
      throw new FatalReleaseActionError();
    }

    const branchVersion = convertVersionBranchToSemVer(branch);
    if (branchVersion === null) {
      Log.error('Could not parse version branch.');
      throw new FatalReleaseActionError();
    }
    return {branch, branchVersion};
  }

  static override async isActive(_active: ActiveReleaseTrains) {
    // Only enabled if explicitly enabled for dev-infra team.
    return process.env['NG_DEV_SPECIAL_RELEASE_ACTIONS'] === '1';
  }
}
