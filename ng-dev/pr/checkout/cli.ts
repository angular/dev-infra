/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';
import {Log} from '../../utils/logging.js';

import {addGithubTokenOption} from '../../utils/git/github-yargs.js';
import {checkOutPullRequestLocally} from '../common/checkout-pr.js';

export interface CheckoutOptions {
  pr: number;
}

/** Builds the checkout pull request command. */
function builder(yargs: Argv) {
  return addGithubTokenOption(yargs).positional('pr', {type: 'number', demandOption: true});
}

/** Handles the checkout pull request command. */
async function handler({pr}: Arguments<CheckoutOptions>) {
  const options = {allowIfMaintainerCannotModify: true, branchName: `pr-${pr}`};
  const {pushToUpstreamCommand} = await checkOutPullRequestLocally(pr, options);
  Log.info(`Checked out the remote branch for pull request #${pr}\n`);
  Log.info('To push the checked out branch back to its PR, run the following command:');
  Log.info(`  $ ${pushToUpstreamCommand}`);
}

/** yargs command module for checking out a PR  */
export const CheckoutCommandModule: CommandModule<{}, CheckoutOptions> = {
  handler,
  builder,
  command: 'checkout <pr>',
  describe: 'Checkout a PR from the upstream repo',
};
