/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommandModule} from 'yargs';

import {GitClient} from '../../utils/git/git-client';
import {assertValidReleaseConfig} from '../config/index';
import {fetchActiveReleaseTrains} from '../versioning/active-release-trains';
import {printActiveReleaseTrains} from '../versioning/print-active-trains';
import {getNextBranchName, ReleaseRepoWithApi} from '../versioning';
import {getConfig} from '../../utils/config';

/** Yargs command handler for printing release information. */
async function handler() {
  const git = GitClient.get();
  const nextBranchName = getNextBranchName(git.config.github);
  const repo: ReleaseRepoWithApi = {api: git.github, ...git.remoteConfig, nextBranchName};
  const releaseTrains = await fetchActiveReleaseTrains(repo);
  const config = getConfig();
  assertValidReleaseConfig(config);

  // Print the active release trains.
  await printActiveReleaseTrains(releaseTrains, config.release);
}

/** CLI command module for retrieving release information. */
export const ReleaseInfoCommandModule: CommandModule = {
  handler,
  command: 'info',
  describe: 'Prints active release trains to the console.',
};
