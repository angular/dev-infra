/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirname, join} from 'path';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {bold, green, Log} from '../../utils/logging.js';
import {Prompt} from '../../utils/prompt.js';
import {checkOutPullRequestLocally} from '../common/checkout-pr.js';
import {fileURLToPath} from 'url';

/** List of accounts that are supported for takeover. */
const takeoverAccounts = ['angular-robot'];

/**
 * Checkout the provided pull request in preperation for a new takeover pull request to be made
 */
export async function checkoutAsPrTakeover(
  prNumber: number,
  {resetGitState, pullRequest}: Awaited<ReturnType<typeof checkOutPullRequestLocally>>,
) {
  /** An authenticated git client. */
  const git = await AuthenticatedGitClient.get();
  /** The branch name to be used for the takeover attempt. */
  const branchName = `pr-takeover-${prNumber}`;

  if (git.runGraceful(['rev-parse', '-q', '--verify', branchName]).status === 0) {
    Log.error(` ✘ Expected branch name \`${branchName}\` already exists locally`);
    return;
  }

  // Validate that the takeover attempt is being made against a pull request created by an
  // expected account.
  if (!takeoverAccounts.includes(pullRequest.author.login)) {
    Log.warn(
      ` ⚠ ${bold(pullRequest.author.login)} is not an account fully supported for takeover.`,
    );
    Log.warn(`   Supported accounts: ${bold(takeoverAccounts.join(', '))}`);
    if (
      await Prompt.confirm({
        message: `Continue with pull request takeover anyway?`,
        default: true,
      })
    ) {
      Log.debug('Continuing per user confirmation in prompt');
    } else {
      Log.info('Aborting takeover..');
      resetGitState();
      return;
    }
  }

  Log.info(`Setting local branch name based on the pull request`);
  git.run(['checkout', '-q', '-b', branchName]);

  Log.info('Updating commit messages to close previous pull request');
  git.run([
    'filter-branch',
    '-f',
    '--msg-filter',
    `${getCommitMessageFilterScriptPath()} ${prNumber}`,
    `${pullRequest.baseRefOid}..HEAD`,
  ]);

  Log.info(` ${green('✔')} Checked out pull request #${prNumber} into branch: ${branchName}`);
}

/** Gets the absolute file path to the commit-message filter script. */
function getCommitMessageFilterScriptPath(): string {
  // This file is getting bundled and ends up in `<pkg-root>/bundles/<chunk>`. We also
  // bundle the commit-message-filter script as another entry-point and can reference
  // it relatively as the path is preserved inside `bundles/`.
  // *Note*: Relying on package resolution is problematic within ESM and with `local-dev.sh`
  const bundlesDir = dirname(fileURLToPath(import.meta.url));
  return join(bundlesDir, './pr/checkout/commit-message-filter.mjs');
}
