/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs.js';
import {checkoutPullRequest, CheckoutPullRequestParams} from './checkout.js';

/** Builds the checkout pull request command. */
function builder(yargs: Argv) {
  return addGithubTokenOption(yargs)
    .positional('pr', {
      type: 'number',
      demandOption: true,
      describe: 'The pull request number for the pull request to checkout',
    })
    .option('takeover', {
      type: 'boolean',
      demandOption: false,
      describe: 'Check out the pull request to perform a takeover',
    });
}

/** Handles the checkout pull request command. */
async function handler({pr, takeover}: Arguments<CheckoutPullRequestParams>) {
  await checkoutPullRequest({pr, takeover});
}

/** yargs command module for checking out a PR  */
export const CheckoutCommandModule: CommandModule<{}, CheckoutPullRequestParams> = {
  handler,
  builder,
  command: 'checkout <pr>',
  describe: 'Checkout a PR from the upstream repo',
};
