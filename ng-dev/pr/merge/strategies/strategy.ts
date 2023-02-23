/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {
  MergeConflictsFatalError,
  MismatchedTargetBranchFatalError,
  UnsatisfiedBaseShaFatalError,
} from '../failures.js';
import {PullRequest} from '../pull-request.js';

/**
 * Name of a temporary branch that contains the head of a currently-processed PR. Note
 * that a branch name should be used that most likely does not conflict with other local
 * development branches.
 */
export const TEMP_PR_HEAD_BRANCH = 'merge_pr_head';

/**
 * Base class for merge strategies. A merge strategy accepts a pull request and
 * merges it into the determined target branches.
 */
export abstract class MergeStrategy {
  constructor(protected git: AuthenticatedGitClient) {}

  /**
   * Prepares a merge of the given pull request. The strategy by default will
   * fetch all target branches and the pull request into local temporary branches.
   */
  async prepare(pullRequest: PullRequest) {
    this.fetchTargetBranches(
      pullRequest.targetBranches,
      `pull/${pullRequest.prNumber}/head:${TEMP_PR_HEAD_BRANCH}`,
    );
  }

  /**
   * Performs the merge of the given pull request. This needs to be implemented
   * by individual merge strategies.
   *
   * @throws {FatalMergeToolError} A fatal error has occurred when attempting to merge the
   *   pull request.
   */
  abstract merge(pullRequest: PullRequest): Promise<void>;

  /**
   * Checks to confirm that a pull request in its current state is able to merge as expected to
   * the targeted branches. This method notably does not commit any attempted cherry-picks during
   * its check, but instead leaves this to the merging action.
   *
   * @throws {GitCommandError} An unknown Git command error occurred that is not
   *   specific to the pull request merge.
   * @throws {UnsatisfiedBaseShaFatalError} A fatal error if a specific is required to be present
   *   in the pull requests branch and is not present in that branch.
   * @throws {MismatchedTargetBranchFatalError} A fatal error if the pull request does not target
   *   a branch via the Github UI that is managed by merge tooling.
   */
  async check(pullRequest: PullRequest): Promise<void> {
    const {githubTargetBranch, targetBranches, requiredBaseSha} = pullRequest;
    // If the pull request does not have its base branch set to any determined target
    // branch, we cannot merge using the API.
    if (targetBranches.every((t) => t !== githubTargetBranch)) {
      throw new MismatchedTargetBranchFatalError(targetBranches);
    }

    // In cases where a required base commit is specified for this pull request, check if
    // the pull request contains the given commit. If not, return a pull request failure.
    // This check is useful for enforcing that PRs are rebased on top of a given commit.
    // e.g. a commit that changes the code ownership validation. PRs which are not rebased
    // could bypass new codeowner ship rules.
    if (requiredBaseSha && !this.git.hasCommit(TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
      throw new UnsatisfiedBaseShaFatalError();
    }

    // First cherry-pick the PR into all local target branches in dry-run mode. This is
    // purely for testing so that we can figure out whether the PR can be cherry-picked
    // into the other target branches. We don't want to merge the PR through the API, and
    // then run into cherry-pick conflicts after the initial merge already completed.
    await this._assertMergeableOrThrow(pullRequest, targetBranches);
  }

  /** Cleans up the pull request merge. e.g. deleting temporary local branches. */
  async cleanup(pullRequest: PullRequest) {
    // Delete all temporary target branches.
    pullRequest.targetBranches.forEach((branchName) =>
      this.git.run(['branch', '-D', this.getLocalTargetBranchName(branchName)]),
    );

    // Delete temporary branch for the pull request head.
    this.git.run(['branch', '-D', TEMP_PR_HEAD_BRANCH]);
  }

  /** Gets a deterministic local branch name for a given branch. */
  protected getLocalTargetBranchName(targetBranch: string): string {
    return `merge_pr_target_${targetBranch.replace(/\//g, '_')}`;
  }

  /**
   * Cherry-picks the given revision range into the specified target branches.
   * @returns A list of branches for which the revisions could not be cherry-picked into.
   */
  protected cherryPickIntoTargetBranches(
    revisionRange: string,
    targetBranches: string[],
    options: {
      dryRun?: boolean;
      linkToOriginalCommits?: boolean;
    } = {},
  ) {
    const cherryPickArgs = [revisionRange];
    const failedBranches: string[] = [];

    if (options.dryRun) {
      // https://git-scm.com/docs/git-cherry-pick#Documentation/git-cherry-pick.txt---no-commit
      // This causes `git cherry-pick` to not generate any commits. Instead, the changes are
      // applied directly in the working tree. This allow us to easily discard the changes
      // for dry-run purposes.
      cherryPickArgs.push('--no-commit');
    }

    if (options.linkToOriginalCommits) {
      // We add `-x` when cherry-picking as that will allow us to easily jump to original
      // commits for cherry-picked commits. With that flag set, Git will automatically append
      // the original SHA/revision to the commit message. e.g. `(cherry picked from commit <..>)`.
      // https://git-scm.com/docs/git-cherry-pick#Documentation/git-cherry-pick.txt--x.
      cherryPickArgs.push('-x');
    }

    // Cherry-pick the refspec into all determined target branches.
    for (const branchName of targetBranches) {
      const localTargetBranch = this.getLocalTargetBranchName(branchName);
      // Checkout the local target branch.
      this.git.run(['checkout', localTargetBranch]);
      // Cherry-pick the refspec into the target branch.
      if (this.git.runGraceful(['cherry-pick', ...cherryPickArgs]).status !== 0) {
        // Abort the failed cherry-pick. We do this because Git persists the failed
        // cherry-pick state globally in the repository. This could prevent future
        // pull request merges as a Git thinks a cherry-pick is still in progress.
        this.git.runGraceful(['cherry-pick', '--abort']);
        failedBranches.push(branchName);
      }
      // If we run with dry run mode, we reset the local target branch so that all dry-run
      // cherry-pick changes are discard. Changes are applied to the working tree and index.
      if (options.dryRun) {
        this.git.run(['reset', '--hard', 'HEAD']);
      }
    }
    return failedBranches;
  }

  /**
   * Fetches the given target branches. Also accepts a list of additional refspecs that
   * should be fetched. This is helpful as multiple slow fetches could be avoided.
   */
  protected fetchTargetBranches(names: string[], ...extraRefspecs: string[]) {
    const fetchRefspecs = names.map((targetBranch) => {
      const localTargetBranch = this.getLocalTargetBranchName(targetBranch);
      return `refs/heads/${targetBranch}:${localTargetBranch}`;
    });
    // Fetch all target branches with a single command. We don't want to fetch them
    // individually as that could cause an unnecessary slow-down.
    this.git.run([
      'fetch',
      '-q',
      '-f',
      this.git.getRepoGitUrl(),
      ...fetchRefspecs,
      ...extraRefspecs,
    ]);
  }

  /** Pushes the given target branches upstream. */
  protected pushTargetBranchesUpstream(names: string[]) {
    const pushRefspecs = names.map((targetBranch) => {
      const localTargetBranch = this.getLocalTargetBranchName(targetBranch);
      return `${localTargetBranch}:refs/heads/${targetBranch}`;
    });
    // Push all target branches with a single command if we don't run in dry-run mode.
    // We don't want to push them individually as that could cause an unnecessary slow-down.
    this.git.run(['push', '--atomic', this.git.getRepoGitUrl(), ...pushRefspecs]);
  }

  /** Asserts that given pull request could be merged into the given target branches. */
  protected async _assertMergeableOrThrow(
    {revisionRange}: PullRequest,
    targetBranches: string[],
  ): Promise<void> {
    const failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches, {
      dryRun: true,
    });

    if (failedBranches.length) {
      throw new MergeConflictsFatalError(failedBranches);
    }
  }
}
