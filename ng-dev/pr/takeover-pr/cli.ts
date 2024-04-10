/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs.js';
import {takeoverPullRequest} from './takeover-pr.js';

export interface CheckoutOptions {
  pr: number;
  branch?: string;
}

/** Builds the checkout pull request command. */
function builder(yargs: Argv) {
  return addGithubTokenOption(yargs)
    .positional('pr', {type: 'number', demandOption: true})
    .option('branch', {
      type: 'string',
      describe: 'An optional branch name to use instead of a pull request number based name',
      demandOption: false,
    });
}

/** Handles the checkout pull request command. */
async function handler(options: Arguments<CheckoutOptions>) {
  await takeoverPullRequest(options);
}

/** yargs command module for checking out a PR  */
export const TakeoverPrCommandModule: CommandModule<{}, CheckoutOptions> = {
  handler,
  builder,
  command: 'takeover <pr>',
  describe: 'Takeover a pull request from a stale upstream pull request',
};
