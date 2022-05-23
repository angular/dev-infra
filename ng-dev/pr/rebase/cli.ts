/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs';

import {rebasePr} from './index';

/** The options available to the rebase command via CLI. */
export interface RebaseOptions {
  githubToken: string;
  pr: number;
}

/** Builds the rebase pull request command. */
function builder(yargs: Argv): Argv<RebaseOptions> {
  return addGithubTokenOption(yargs).positional('pr', {type: 'number', demandOption: true});
}

/** Handles the rebase pull request command. */
async function handler({pr, githubToken}: Arguments<RebaseOptions>) {
  process.exitCode = await rebasePr(pr, githubToken);
}

/** yargs command module for rebaseing a PR  */
export const RebaseCommandModule: CommandModule<{}, RebaseOptions> = {
  handler,
  builder,
  command: 'checkout <pr>',
  describe: 'Checkout a PR from the upstream repo',
};
