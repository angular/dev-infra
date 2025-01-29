/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {green, Log, red} from '../../utils/logging.js';
import {checkOutPullRequestLocally} from '../common/checkout-pr.js';
import {Prompt} from '../../utils/prompt.js';
import {checkoutToTargetBranch} from './target.js';
import {checkoutAsPrTakeover} from './takeover.js';

export interface CheckoutPullRequestParams {
  pr: number;
  takeover?: boolean;
  target?: string;
}

export async function checkoutPullRequest(params: CheckoutPullRequestParams): Promise<void> {
  const {pr, takeover, target} = params;
  /** An authenticated git client. */
  const git = await AuthenticatedGitClient.get();

  if (takeover && target) {
    Log.error(` ${red('✘')} The --takeover and --target flags cannot be provided simultaneously`);
    return;
  }

  // Make sure the local repository is clean.
  if (git.hasUncommittedChanges()) {
    Log.error(
      ` ${red('✘')} Local working repository not clean. Please make sure there are no uncommitted changes`,
    );
    return;
  }

  const localCheckoutResult = await checkOutPullRequestLocally(pr, {
    allowIfMaintainerCannotModify: true,
  });

  if (takeover) {
    return await checkoutAsPrTakeover(pr, localCheckoutResult);
  }

  if (target) {
    return await checkoutToTargetBranch(pr, target, localCheckoutResult);
  }

  /**
   * Whether the pull request is configured to allow for the maintainers to modify the pull request.
   */
  const maintainerCanModify = localCheckoutResult.pullRequest.maintainerCanModify;

  if (!maintainerCanModify) {
    Log.info('The author of this pull request does not allow maintainers to modify the pull');
    Log.info('request. Since you will not be able to push changes to the original pull request');
    Log.info('you will instead need to perform a "takeover." In a takeover, the original pull');
    Log.info('request will be checked out, the commits are modified to close the original on');
    Log.info('merge of the newly created branch.');

    if (
      await Prompt.confirm({
        message: `Would you like to create a takeover pull request?`,
        default: true,
      })
    ) {
      return await checkoutAsPrTakeover(pr, localCheckoutResult);
    }
  }

  Log.info(` ${green('✔')} Checked out the remote branch for pull request #${pr}`);
  if (maintainerCanModify) {
    Log.info('To push the checked out branch back to its PR, run the following command:');
    Log.info(`  $ ${localCheckoutResult.pushToUpstreamCommand}`);
  }
}
