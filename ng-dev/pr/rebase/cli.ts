/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs.js';

import {rebasePr} from './index.js';

/** The options available to the rebase command via CLI. */
export interface RebaseOptions {
  githubToken: string;
  pr: number;
}

/** Builds the rebase pull request command. */
function builder(argv: Argv): Argv<RebaseOptions> {
  return addGithubTokenOption(argv).positional('pr', {type: 'number', demandOption: true});
}

/** Handles the rebase pull request command. */
async function handler({pr, githubToken}: Arguments<RebaseOptions>) {
  process.exitCode = await rebasePr(pr, githubToken);
}

/** yargs command module for rebasing a PR  */
export const RebaseCommandModule: CommandModule<{}, RebaseOptions> = {
  handler,
  builder,
  command: 'rebase <pr>',
  describe: 'Rebase a pending PR and push the rebased commits back to Github',
};
