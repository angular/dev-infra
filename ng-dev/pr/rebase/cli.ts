/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import yargs from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs';

import {rebasePr} from './index';

/** The options available to the rebase command via CLI. */
export interface RebaseOptions {
  githubToken: string;
  pr: number;
}

/** Builds the rebase pull request command. */
function builder(argv: yargs.Argv): yargs.Argv<RebaseOptions> {
  return addGithubTokenOption(argv).positional('pr', {type: 'number', demandOption: true});
}

/** Handles the rebase pull request command. */
async function handler({pr, githubToken}: yargs.Arguments<RebaseOptions>) {
  process.exitCode = await rebasePr(pr, githubToken);
}

/** yargs command module for rebasing a PR  */
export const RebaseCommandModule: yargs.CommandModule<{}, RebaseOptions> = {
  handler,
  builder,
  command: 'rebase <pr>',
  describe: 'Rebase a pending PR and push the rebased commits back to Github',
};
