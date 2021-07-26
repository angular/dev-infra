/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {promptConfirm} from '../../utils/console';
import {GitClient, GitCommandError} from '../../utils/git';

import {MergeConfigWithRemote} from './config';
import {PullRequestFailure} from './failures';
import {getCaretakerNotePromptMessage, getTargettedBranchesConfirmationPromptMessage} from './messages';
import {isPullRequest, loadAndValidatePullRequest,} from './pull-request';
import {GithubApiMergeStrategy} from './strategies/api-merge';
import {AutosquashMergeStrategy} from './strategies/autosquash-merge';

/** Describes the status of a pull request merge. */
export const enum MergeStatus {
  UNKNOWN_GIT_ERROR,
  DIRTY_WORKING_DIR,
  SUCCESS,
  FAILED,
  USER_ABORTED,
  GITHUB_ERROR,
}

/** Result of a pull request merge. */
export interface MergeResult {
  /** Overall status of the merge. */
  status: MergeStatus;
  /** List of pull request failures. */
  failure?: PullRequestFailure;
}

/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
export class PullRequestMergeTask {
  constructor(public config: MergeConfigWithRemote, public git: GitClient) {}

  /**
   * Merges the given pull request and pushes it upstream.
   * @param prNumber Pull request that should be merged.
   * @param force Whether non-critical pull request failures should be ignored.
   */
  async merge(prNumber: number, force = false): Promise<MergeResult> {
    // Check whether the given Github token has sufficient permissions for writing
    // to the configured repository. If the repository is not private, only the
    // reduced `public_repo` OAuth scope is sufficient for performing merges.
    const hasOauthScopes = await this.git.hasOauthScopes((scopes, missing) => {
      if (!scopes.includes('repo')) {
        if (this.config.remote.private) {
          missing.push('repo');
        } else if (!scopes.includes('public_repo')) {
          missing.push('public_repo');
        }
      }
    });

    if (hasOauthScopes !== true) {
      return {
        status: MergeStatus.GITHUB_ERROR,
        failure: PullRequestFailure.insufficientPermissionsToMerge(hasOauthScopes.error)
      };
    }

    if (this.git.hasUncommittedChanges()) {
      return {status: MergeStatus.DIRTY_WORKING_DIR};
    }

    const pullRequest = await loadAndValidatePullRequest(this, prNumber, force);

    if (!isPullRequest(pullRequest)) {
      return {status: MergeStatus.FAILED, failure: pullRequest};
    }


    if (!await promptConfirm(getTargettedBranchesConfirmationPromptMessage(pullRequest))) {
      return {status: MergeStatus.USER_ABORTED};
    }


    // If the pull request has a caretaker note applied, raise awareness by prompting
    // the caretaker. The caretaker can then decide to proceed or abort the merge.
    if (pullRequest.hasCaretakerNote &&
        !await promptConfirm(getCaretakerNotePromptMessage(pullRequest))) {
      return {status: MergeStatus.USER_ABORTED};
    }

    const strategy = this.config.githubApiMerge ?
        new GithubApiMergeStrategy(this.git, this.config.githubApiMerge) :
        new AutosquashMergeStrategy(this.git);

    // Branch or revision that is currently checked out so that we can switch back to
    // it once the pull request has been merged.
    let previousBranchOrRevision: null|string = null;

    // The following block runs Git commands as child processes. These Git commands can fail.
    // We want to capture these command errors and return an appropriate merge request status.
    try {
      previousBranchOrRevision = this.git.getCurrentBranchOrRevision();

      // Run preparations for the merge (e.g. fetching branches).
      await strategy.prepare(pullRequest);

      // Perform the merge and capture potential failures.
      const failure = await strategy.merge(pullRequest);
      if (failure !== null) {
        return {status: MergeStatus.FAILED, failure};
      }

      // Switch back to the previous branch. We need to do this before deleting the temporary
      // branches because we cannot delete branches which are currently checked out.
      this.git.run(['checkout', '-f', previousBranchOrRevision]);

      await strategy.cleanup(pullRequest);

      // Return a successful merge status.
      return {status: MergeStatus.SUCCESS};
    } catch (e) {
      // Catch all git command errors and return a merge result w/ git error status code.
      // Other unknown errors which aren't caused by a git command are re-thrown.
      if (e instanceof GitCommandError) {
        return {status: MergeStatus.UNKNOWN_GIT_ERROR};
      }
      throw e;
    } finally {
      // Always try to restore the branch if possible. We don't want to leave
      // the repository in a different state than before.
      if (previousBranchOrRevision !== null) {
        this.git.runGraceful(['checkout', '-f', previousBranchOrRevision]);
      }
    }
  }
}
