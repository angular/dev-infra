/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Commit} from '../../commit-message/parse';
import {getCommitsInRange} from '../../commit-message/utils';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {addTokenToGitHttpsUrl} from '../../utils/git/github-urls';
import {Log} from '../../utils/logging';
import {Prompt} from '../../utils/prompt';
import {fetchPullRequestFromGithub} from '../common/fetch-pull-request';

/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 *
 * @returns a status code indicating whether the rebase was successful.
 */
export async function rebasePr(prNumber: number, githubToken: string): Promise<number> {
  /** The singleton instance of the authenticated git client. */
  const git = AuthenticatedGitClient.get();
  if (git.hasUncommittedChanges()) {
    Log.error('Cannot perform rebase of PR with local changes.');
    return 1;
  }

  /**
   * The branch or revision originally checked out before this method performed
   * any Git operations that may change the working branch.
   */
  const previousBranchOrRevision = git.getCurrentBranchOrRevision();
  /* Get the PR information from Github. */
  const pr = await fetchPullRequestFromGithub(git, prNumber);

  if (pr === null) {
    Log.error(`Specified pull request does not exist.`);
    return 1;
  }

  const headRefName = pr.headRef.name;
  const baseRefName = pr.baseRef.name;
  const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
  const fullBaseRef = `${pr.baseRef.repository.nameWithOwner}:${baseRefName}`;
  const headRefUrl = addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
  const baseRefUrl = addTokenToGitHttpsUrl(pr.baseRef.repository.url, githubToken);

  // Note: Since we use a detached head for rebasing the PR and therefore do not have
  // remote-tracking branches configured, we need to set our expected ref and SHA. This
  // allows us to use `--force-with-lease` for the detached head while ensuring that we
  // never accidentally override upstream changes that have been pushed in the meanwhile.
  // See:
  // https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt
  const forceWithLeaseFlag = `--force-with-lease=${headRefName}:${pr.headRefOid}`;

  // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
  // be pushed up.
  if (!pr.maintainerCanModify && !pr.viewerDidAuthor) {
    Log.error(
      `Cannot rebase as you did not author the PR and the PR does not allow maintainers` +
        `to modify the PR`,
    );
    return 1;
  }

  try {
    // Fetches are done with --deepen=500 increase the likelihood of finding a common ancestor when
    // a shallow clone is being used.

    // Fetch the branch at the commit of the PR, and check it out in a detached state.
    Log.info(`Checking out PR #${prNumber} from ${fullHeadRef}`);
    git.run(['fetch', '-q', headRefUrl, headRefName, '--deepen=500']);
    git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
    // Fetch the PRs target branch and rebase onto it.
    Log.info(`Fetching ${fullBaseRef} to rebase #${prNumber} on`);
    git.run(['fetch', '-q', baseRefUrl, baseRefName, '--deepen=500']);

    const commonAncestorSha = git.run(['merge-base', 'HEAD', 'FETCH_HEAD']).stdout.trim();

    const commits = await getCommitsInRange(commonAncestorSha, 'HEAD');

    let squashFixups =
      process.env['CI'] !== undefined ||
      commits.filter((commit: Commit) => commit.isFixup).length === 0
        ? false
        : await Prompt.confirm(
            `PR #${prNumber} contains fixup commits, would you like to squash them during rebase?`,
            true,
          );

    Log.info(`Attempting to rebase PR #${prNumber} on ${fullBaseRef}`);

    /**
     * Tuple of flags to be added to the rebase command and env object to run the git command.
     *
     * Additional flags to perform the autosquashing are added when the user confirm squashing of
     * fixup commits should occur.
     */
    const [flags, env] = squashFixups
      ? [['--interactive', '--autosquash'], {...process.env, GIT_SEQUENCE_EDITOR: 'true'}]
      : [[], undefined];
    const rebaseResult = git.runGraceful(['rebase', ...flags, 'FETCH_HEAD'], {env: env});

    // If the rebase was clean, push the rebased PR up to the authors fork.
    if (rebaseResult.status === 0) {
      Log.info(`Rebase was able to complete automatically without conflicts`);
      Log.info(`Pushing rebased PR #${prNumber} to ${fullHeadRef}`);
      git.run(['push', headRefUrl, `HEAD:${headRefName}`, forceWithLeaseFlag]);
      Log.info(`Rebased and updated PR #${prNumber}`);
      git.checkout(previousBranchOrRevision, true);
      return 0;
    }
  } catch (err) {
    Log.error(err);
    git.checkout(previousBranchOrRevision, true);
    return 1;
  }

  // On automatic rebase failures, prompt to choose if the rebase should be continued
  // manually or aborted now.
  Log.info(`Rebase was unable to complete automatically without conflicts.`);
  // If the command is run in a non-CI environment, prompt to allow for the user to
  // manually complete the rebase.
  const continueRebase =
    process.env['CI'] === undefined && (await Prompt.confirm('Manually complete rebase?'));

  if (continueRebase) {
    Log.info(
      `After manually completing rebase, run the following command to update PR #${prNumber}:`,
    );
    Log.info(` $ git push ${pr.headRef.repository.url} HEAD:${headRefName} ${forceWithLeaseFlag}`);
    Log.info();
    Log.info(`To abort the rebase and return to the state of the repository before this command`);
    Log.info(`run the following command:`);
    Log.info(
      ` $ git rebase --abort && git reset --hard && git checkout ${previousBranchOrRevision}`,
    );
    return 1;
  } else {
    Log.info(`Cleaning up git state, and restoring previous state.`);
  }

  git.checkout(previousBranchOrRevision, true);
  return 1;
}
