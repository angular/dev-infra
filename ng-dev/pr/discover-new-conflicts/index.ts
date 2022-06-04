/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Bar} from 'cli-progress';

import {Log} from '../../utils/logging';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {GitCommandError} from '../../utils/git/git-client';
import {
  fetchPendingPullRequestsFromGithub,
  PullRequestFromGithub,
} from '../common/fetch-pull-request';

/** Name of a temporary local branch that is used for checking conflicts. **/
const tempWorkingBranch = '__NgDevRepoBaseAfterChange__';

/** Checks if the provided PR will cause new conflicts in other pending PRs. */
export async function discoverNewConflictsForPr(newPrNumber: number, updatedAfter: number) {
  /** The singleton instance of the authenticated git client. */
  const git = AuthenticatedGitClient.get();
  // If there are any local changes in the current repository state, the
  // check cannot run as it needs to move between branches.
  if (git.hasUncommittedChanges()) {
    Log.error('Cannot run with local changes. Please make sure there are no local changes.');
    process.exit(1);
  }

  /** The active github branch or revision before we performed any Git commands. */
  const previousBranchOrRevision = git.getCurrentBranchOrRevision();
  /* Progress bar to indicate progress. */
  const progressBar = new Bar({format: `[{bar}] ETA: {eta}s | {value}/{total}`});
  /* PRs which were found to be conflicting. */
  const conflicts: Array<PullRequestFromGithub> = [];

  Log.info(`Requesting pending PRs from Github`);
  /** List of PRs from github currently known as mergable. */
  const allPendingPRs = await fetchPendingPullRequestsFromGithub(git);

  if (allPendingPRs === null) {
    Log.error('Unable to find any pending PRs in the repository');
    process.exit(1);
  }

  /** The PR which is being checked against. */
  const requestedPr = allPendingPRs.find((pr) => pr.number === newPrNumber);
  if (requestedPr === undefined) {
    Log.error(
      `The request PR, #${newPrNumber} was not found as a pending PR on github, please confirm`,
    );
    Log.error(`the PR number is correct and is an open PR`);
    process.exit(1);
  }

  const pendingPrs = allPendingPRs.filter((pr) => {
    return (
      // PRs being merged into the same target branch as the requested PR
      pr.baseRef.name === requestedPr.baseRef.name &&
      // PRs which either have not been processed or are determined as mergable by Github
      pr.mergeable !== 'CONFLICTING' &&
      // PRs updated after the provided date
      new Date(pr.updatedAt).getTime() >= updatedAfter
    );
  });
  Log.info(`Retrieved ${allPendingPRs.length} total pending PRs`);
  Log.info(`Checking ${pendingPrs.length} PRs for conflicts after a merge of #${newPrNumber}`);

  // Fetch and checkout the PR being checked.
  git.run(['fetch', '-q', requestedPr.headRef.repository.url, requestedPr.headRef.name]);
  git.run(['checkout', '-q', '-B', tempWorkingBranch, 'FETCH_HEAD']);

  // Rebase the PR against the PRs target branch.
  git.run(['fetch', '-q', requestedPr.baseRef.repository.url, requestedPr.baseRef.name]);
  try {
    git.run(['rebase', 'FETCH_HEAD'], {stdio: 'ignore'});
  } catch (err) {
    if (err instanceof GitCommandError) {
      Log.error('The requested PR currently has conflicts');
      git.checkout(previousBranchOrRevision, true);
      process.exit(1);
    }
    throw err;
  }

  // Start the progress bar
  progressBar.start(pendingPrs.length, 0);

  // Check each PR to determine if it can merge cleanly into the repo after the target PR.
  for (const pr of pendingPrs) {
    // Fetch and checkout the next PR
    git.run(['fetch', '-q', pr.headRef.repository.url, pr.headRef.name]);
    git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
    // Check if the PR cleanly rebases into the repo after the target PR.
    try {
      git.run(['rebase', tempWorkingBranch], {stdio: 'ignore'});
    } catch (err) {
      if (err instanceof GitCommandError) {
        conflicts.push(pr);
      } else {
        throw err;
      }
    }
    // Abort any outstanding rebase attempt.
    git.runGraceful(['rebase', '--abort'], {stdio: 'ignore'});

    progressBar.increment(1);
  }
  // End the progress bar as all PRs have been processed.
  progressBar.stop();
  Log.info();
  Log.info(`Result:`);

  git.checkout(previousBranchOrRevision, true);

  // If no conflicts are found, exit successfully.
  if (conflicts.length === 0) {
    Log.info(`No new conflicting PRs found after #${newPrNumber} merging`);
    process.exit(0);
  }

  // Inform about discovered conflicts, exit with failure.
  Log.error.group(`${conflicts.length} PR(s) which conflict(s) after #${newPrNumber} merges:`);
  for (const pr of conflicts) {
    Log.error(`  - #${pr.number}: ${pr.title}`);
  }
  Log.error.groupEnd();
  process.exit(1);
}
