/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../utils/git/git-client.js';

/** State of a pull request in Github. */
export type PullRequestState = 'merged' | 'unknown';

/**
 * Gets whether a given pull request has been merged.
 *
 * Note: There are situations where GitHub still processes the merging or
 * closing action and temporarily this function would return `false`. Make
 * sure to account for this when logic relies on this method.
 *
 * More details here: https://github.com/angular/angular/pull/40181.
 *
 * @throws May throw Github API request errors if e.g. a pull request
 *   cannot be found, or the repository is not existing/visible.
 */
export async function isPullRequestMerged(api: GitClient, id: number): Promise<boolean> {
  const {data} = await api.github.pulls.get({...api.remoteParams, pull_number: id});
  if (data.merged) {
    return true;
  }
  return await isPullRequestClosedWithAssociatedCommit(api, id);
}

/**
 * Whether the pull request has been closed with an associated commit. This is usually
 * the case if a PR has been merged using the autosquash merge script strategy. Since
 * the merge is not fast-forward, Github does not consider the PR as merged and instead
 * shows the PR as closed. See for example: https://github.com/angular/angular/pull/37918.
 */
async function isPullRequestClosedWithAssociatedCommit(api: GitClient, id: number) {
  const events = await api.github.paginate(api.github.issues.listEvents, {
    ...api.remoteParams,
    issue_number: id,
  });
  // Iterate through the events of the pull request in reverse. We want to find the most
  // recent events and check if the PR has been closed with a commit associated with it.
  // If the PR has been closed through a commit, we assume that the PR has been merged
  // using the autosquash merge strategy. For more details. See the `AutosquashMergeStrategy`.
  for (let i = events.length - 1; i >= 0; i--) {
    const {event, commit_id} = events[i];
    // If we come across a "reopened" event, we abort looking for referenced commits. Any
    // commits that closed the PR before, are no longer relevant and did not close the PR.
    if (event === 'reopened') {
      return false;
    }
    // If a `closed` event is captured with a commit assigned, then we assume that
    // this PR has been merged properly.
    if (event === 'closed' && commit_id) {
      return true;
    }
    // If the PR has been referenced by a commit, check if the commit closes this pull
    // request. Note that this is needed besides checking `closed` as PRs could be merged
    // into any non-default branch where the `Closes <..>` keyword does not work and the PR
    // is simply closed without an associated `commit_id`. For more details see:
    // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords#:~:text=non-default.
    if (
      event === 'referenced' &&
      commit_id &&
      (await isCommitClosingPullRequest(api, commit_id, id))
    ) {
      return true;
    }
  }
  return false;
}

/** Checks whether the specified commit is closing the given pull request. */
async function isCommitClosingPullRequest(api: GitClient, sha: string, id: number) {
  const {data} = await api.github.repos.getCommit({...api.remoteParams, ref: sha});
  // Matches the closing keyword supported in commit messages. See:
  // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords.
  return data.commit.message.match(
    new RegExp(`(?:close[sd]?|fix(?:e[sd]?)|resolve[sd]?):? #${id}(?!\\d)`, 'i'),
  );
}
