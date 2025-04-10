/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs.js';

import {rebasePr} from './index.js';

/** The options available to the rebase command via CLI. */
export interface RebaseOptions {
  pr: number;
  i?: boolean;
}

/** Builds the rebase pull request command. */
function builder(argv: Argv): Argv<RebaseOptions> {
  return addGithubTokenOption(argv)
    .positional('pr', {type: 'number', demandOption: true})
    .option('interactive', {
      type: 'boolean',
      alias: ['i'],
      demandOption: false,
      describe: 'Do the rebase interactively so that things can be squashed and amended',
    });
}

/** Handles the rebase pull request command. */
async function handler({pr, i}: Arguments<RebaseOptions>) {
  process.exitCode = await rebasePr(pr, i);
}

/** yargs command module for rebasing a PR  */
export const RebaseCommandModule: CommandModule<{}, RebaseOptions> = {
  handler,
  builder,
  command: 'rebase <pr>',
  describe: 'Rebase a pending PR and push the rebased commits back to Github',
};
