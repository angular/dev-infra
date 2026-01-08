/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// ---- **IMPORTANT** ----
// This command is part of our external commands invoked by the release publish
// command. Before making changes, keep in mind that more recent `ng-dev` versions
// can still invoke this command.
// ------------------------

import {Argv, Arguments, CommandModule} from 'yargs';

import {GitClient} from '../../utils/git/git-client.js';
import {assertValidReleaseConfig, NpmPackage} from '../config/index.js';
import {ActiveReleaseTrains} from '../versioning/active-release-trains.js';
import {printActiveReleaseTrains} from '../versioning/print-active-trains.js';
import {getNextBranchName, ReleaseRepoWithApi} from '../versioning/index.js';
import {getConfig} from '../../utils/config.js';

/**
 * Type describing the JSON output of this command.
 *
 * @important When changing this, make sure the release action
 *   invocation is updated as well.
 */
export type ReleaseInfoJsonStdout = {npmPackages: NpmPackage[]};

/** Command line options for printing release information. */
export interface ReleaseInfoOptions {
  json: boolean;
}

/** Yargs command builder for the `ng-dev release info` command. */
function builder(argv: Argv): Argv<ReleaseInfoOptions> {
  return argv.option('json', {
    type: 'boolean',
    description: 'Whether information should be written as JSON to stdout.',
    default: false,
  });
}

/** Yargs command handler for printing release information. */
async function handler(argv: Arguments<ReleaseInfoOptions>) {
  const config = await getConfig();
  assertValidReleaseConfig(config);

  // If JSON output is requested, print the information as JSON to stdout.
  if (argv.json) {
    process.stdout.write(JSON.stringify(<ReleaseInfoJsonStdout>config.release, null, 2));
    return;
  }

  const git = await GitClient.get();
  const nextBranchName = getNextBranchName(git.config.github);
  const repo: ReleaseRepoWithApi = {api: git.github, ...git.remoteConfig, nextBranchName};
  const releaseTrains = await ActiveReleaseTrains.fetch(repo);

  // Print the active release trains.
  await printActiveReleaseTrains(releaseTrains, config.release);
}

/** CLI command module for retrieving release information. */
export const ReleaseInfoCommandModule: CommandModule<{}, ReleaseInfoOptions> = {
  builder,
  handler,
  command: 'info',
  // Hidden from help as this is for use by the release tooling itself.
  describe: false,
};
