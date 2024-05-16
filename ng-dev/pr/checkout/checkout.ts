import {dirname, join} from 'path';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {Prompt} from '../../utils/prompt.js';
import {Log, bold, green} from '../../utils/logging.js';
import {checkOutPullRequestLocally} from '../common/checkout-pr.js';
import {fileURLToPath} from 'url';

/** List of accounts that are supported for takeover. */
const takeoverAccounts = ['angular-robot'];

export interface CheckoutPullRequestParams {
  pr: number;
  takeover?: boolean;
}

export async function checkoutPullRequest(params: CheckoutPullRequestParams): Promise<void> {
  const {pr, takeover} = params;
  /** An authenticated git client. */
  const git = await AuthenticatedGitClient.get();
  /** The branch name used for the takeover change. */
  const branchName = `pr-takeover-${pr}`;

  // Make sure the local repository is clean.
  if (git.hasUncommittedChanges()) {
    Log.error(
      ` ✘ Local working repository not clean. Please make sure there are no uncommitted changes`,
    );
    return;
  }

  const {resetGitState, pullRequest, pushToUpstreamCommand} = await checkOutPullRequestLocally(pr, {
    allowIfMaintainerCannotModify: true,
  });

  // if maintainer can modify is false or if takeover is provided do takeover

  if (pullRequest.maintainerCanModify === false || takeover) {
    if (takeover !== true) {
      Log.info('The author of this pull request does not allow maintainers to modify the pull');
      Log.info('request. Since you will not be able to push changes to the original pull request');
      Log.info('you will instead need to perform a "takeover." In a takeover the original pull');
      Log.info('request will be checked out, the commits are modified to close the original on');
      Log.info('merge of the newly created branch.\n');

      if (!(await Prompt.confirm(`Would you like to create a takeover pull request?`, true))) {
        Log.info('Aborting takeover..');
        await resetGitState();
        return;
      }
    }

    if (git.runGraceful(['rev-parse', '-q', '--verify', branchName]).status === 0) {
      Log.error(` ✘ Expected branch name \`${branchName}\` already exists locally`);
      return;
    }

    // Confirm that the takeover request is being done on a valid pull request.
    if (!takeoverAccounts.includes(pullRequest.author.login)) {
      Log.warn(
        ` ⚠ ${bold(pullRequest.author.login)} is not an account fully supported for takeover.`,
      );
      Log.warn(`   Supported accounts: ${bold(takeoverAccounts.join(', '))}`);
      if (await Prompt.confirm(`Continue with pull request takeover anyway?`, true)) {
        Log.debug('Continuing per user confirmation in prompt');
      } else {
        Log.info('Aborting takeover..');
        await resetGitState();
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
      `${getCommitMessageFilterScriptPath()} ${pr}`,
      `${pullRequest.baseRefOid}..HEAD`,
    ]);

    Log.info(` ${green('✔')} Checked out pull request #${pr} into branch: ${branchName}`);
    return;
  }

  Log.info(`Checked out the remote branch for pull request #${pr}\n`);
  Log.info('To push the checked out branch back to its PR, run the following command:');
  Log.info(`  $ ${pushToUpstreamCommand}`);
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
