import {dirname, join} from 'path';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {Log, bold, green} from '../../utils/logging.js';
import {checkOutPullRequestLocally} from '../common/checkout-pr.js';
import {fileURLToPath} from 'url';

/** List of accounts that are supported for takeover. */
const takeoverAccounts = ['angular-robot'];

export async function takeoverPullRequest({
  pr,
  branch,
}: {
  pr: number;
  branch?: string;
}): Promise<void> {
  /** An authenticated git client. */
  const git = await AuthenticatedGitClient.get();
  /** The branch name used for the takeover change. */
  const branchName = branch ?? `pr-${pr}`;

  // Make sure the local repository is clean.
  if (git.hasUncommittedChanges()) {
    Log.error(
      ` ✘ Local working repository not clean. Please make sure there are no uncommitted changes`,
    );
    return;
  }

  // Verify that the expected branch name is available.
  if (git.runGraceful(['rev-parse', '-q', '--verify', branchName]).status === 0) {
    Log.error(` ✘ Expected branch name \`${branchName}\` already in use`);
    return;
  }

  /** The pull request information from Github. */
  const {data: pullRequest} = await git.github.pulls.get({pull_number: pr, ...git.remoteParams});

  // Confirm that the takeover request is being done on a valid pull request.
  if (!takeoverAccounts.includes(pullRequest.user.login)) {
    Log.error(` ✘ Unable to takeover pull request from: ${bold(pullRequest.user.login)}`);
    Log.error(`   Supported accounts: ${bold(takeoverAccounts.join(', '))}`);
    return;
  }

  Log.info(`Checking out \`${pullRequest.head.label}\` locally`);
  await checkOutPullRequestLocally(pr, {allowIfMaintainerCannotModify: true});

  Log.info(`Setting local branch name based on the pull request`);
  git.run(['checkout', '-q', '-b', branchName]);

  Log.info('Updating commit messages to close previous pull request');
  git.run([
    'filter-branch',
    '-f',
    '--msg-filter',
    `${getCommitMessageFilterScriptPath()} ${pr}`,
    `${pullRequest.base.sha}..HEAD`,
  ]);

  Log.info(` ${green('✔')} Checked out pull request #${pr} into branch: ${branchName}`);
}

/** Gets the absolute file path to the commit-message filter script. */
function getCommitMessageFilterScriptPath(): string {
  // This file is getting bundled and ends up in `<pkg-root>/bundles/<chunk>`. We also
  // bundle the commit-message-filter script as another entry-point and can reference
  // it relatively as the path is preserved inside `bundles/`.
  // *Note*: Relying on package resolution is problematic within ESM and with `local-dev.sh`
  const bundlesDir = dirname(fileURLToPath(import.meta.url));
  return join(bundlesDir, './pr/takeover-pr/commit-message-filter.mjs');
}
