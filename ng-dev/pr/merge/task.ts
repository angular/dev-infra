/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {GitCommandError} from '../../utils/git/git-client.js';
import semver from 'semver';
import {prompt} from 'inquirer';
import {Log, red, yellow} from '../../utils/logging.js';

import {PullRequestConfig} from '../config/index.js';
import {PullRequestFailure} from '../common/validation/failures.js';
import {
  getCaretakerNotePromptMessage,
  getTargettedBranchesConfirmationPromptMessage,
} from './messages.js';
import {isPullRequest, loadAndValidatePullRequest, PullRequest} from './pull-request.js';
import {GithubApiMergeStrategy} from './strategies/api-merge.js';
import {AutosquashMergeStrategy} from './strategies/autosquash-merge.js';
import {GithubConfig} from '../../utils/config.js';
import {assertValidReleaseConfig} from '../../release/config/index.js';
import {
  ActiveReleaseTrains,
  fetchLongTermSupportBranchesFromNpm,
  getNextBranchName,
} from '../../release/versioning/index.js';
import {Prompt} from '../../utils/prompt.js';

/** Describes the status of a pull request merge. */
export const enum MergeStatus {
  UNKNOWN_GIT_ERROR,
  DIRTY_WORKING_DIR,
  UNEXPECTED_SHALLOW_REPO,
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

export interface PullRequestMergeTaskFlags {
  branchPrompt: boolean;
  forceManualBranches: boolean;
}

const defaultPullRequestMergeTaskFlags: PullRequestMergeTaskFlags = {
  branchPrompt: true,
  forceManualBranches: false,
};

/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
export class PullRequestMergeTask {
  private flags: PullRequestMergeTaskFlags;

  constructor(
    public config: {pullRequest: PullRequestConfig; github: GithubConfig},
    public git: AuthenticatedGitClient,
    flags: Partial<PullRequestMergeTaskFlags>,
  ) {
    // Update flags property with the provided flags values as patches to the default flag values.
    this.flags = {...defaultPullRequestMergeTaskFlags, ...flags};
  }

  /**
   * Merges the given pull request and pushes it upstream.
   * @param prNumber Pull request that should be merged.
   * @param force Whether non-critical pull request failures should be ignored.
   */
  async merge(prNumber: number, force = false): Promise<MergeResult> {
    if (this.git.hasUncommittedChanges()) {
      return {status: MergeStatus.DIRTY_WORKING_DIR};
    }

    if (this.git.isShallowRepo()) {
      return {status: MergeStatus.UNEXPECTED_SHALLOW_REPO};
    }

    // Check whether the given Github token has sufficient permissions for writing
    // to the configured repository. If the repository is not private, only the
    // reduced `public_repo` OAuth scope is sufficient for performing merges.
    const hasOauthScopes = await this.git.hasOauthScopes((scopes, missing) => {
      if (!scopes.includes('repo')) {
        if (this.config.github.private) {
          missing.push('repo');
        } else if (!scopes.includes('public_repo')) {
          missing.push('public_repo');
        }
      }

      // Pull requests can modify Github action workflow files. In such cases Github requires us to
      // push with a token that has the `workflow` oauth scope set. To avoid errors when the
      // caretaker intends to merge such PRs, we ensure the scope is always set on the token before
      // the merge process starts.
      // https://docs.github.com/en/developers/apps/scopes-for-oauth-apps#available-scopes
      if (!scopes.includes('workflow')) {
        missing.push('workflow');
      }
    });

    if (hasOauthScopes !== true) {
      return {
        status: MergeStatus.GITHUB_ERROR,
        failure: PullRequestFailure.insufficientPermissionsToMerge(hasOauthScopes.error),
      };
    }

    const pullRequest = await loadAndValidatePullRequest(this, prNumber, force);

    if (!isPullRequest(pullRequest)) {
      return {status: MergeStatus.FAILED, failure: pullRequest};
    }

    if (this.flags.forceManualBranches) {
      const forceManualBranchesFailure = await this.setTargetedBranchesManually(pullRequest);
      if (forceManualBranchesFailure) {
        return forceManualBranchesFailure;
      }
    }

    if (
      // In cases where manual branch targeting is used, the user already confirmed.
      !this.flags.forceManualBranches &&
      this.flags.branchPrompt &&
      !(await Prompt.confirm(getTargettedBranchesConfirmationPromptMessage(pullRequest)))
    ) {
      return {status: MergeStatus.USER_ABORTED};
    }

    // If the pull request has a caretaker note applied, raise awareness by prompting
    // the caretaker. The caretaker can then decide to proceed or abort the merge.
    if (
      pullRequest.hasCaretakerNote &&
      !(await Prompt.confirm(getCaretakerNotePromptMessage(pullRequest)))
    ) {
      return {status: MergeStatus.USER_ABORTED};
    }

    const strategy = this.config.pullRequest.githubApiMerge
      ? new GithubApiMergeStrategy(this.git, this.config.pullRequest.githubApiMerge)
      : new AutosquashMergeStrategy(this.git);

    // Branch or revision that is currently checked out so that we can switch back to
    // it once the pull request has been merged.
    const previousBranchOrRevision = this.git.getCurrentBranchOrRevision();

    // The following block runs Git commands as child processes. These Git commands can fail.
    // We want to capture these command errors and return an appropriate merge request status.
    try {
      // Run preparations for the merge (e.g. fetching branches).
      await strategy.prepare(pullRequest);

      // Perform the merge and capture potential failures.
      const failure = await strategy.merge(pullRequest);
      if (failure !== null) {
        return {status: MergeStatus.FAILED, failure};
      }

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
      // Switch back to the previous branch. We need to do this before deleting the temporary
      // branches because we cannot delete branches which are currently checked out.
      this.git.run(['checkout', '-f', previousBranchOrRevision]);

      await strategy.cleanup(pullRequest);
    }
  }

  /**
   * Modifies the pull request in place with new target branches based on user selection from
   * the available active branches.
   */
  private async setTargetedBranchesManually(pullRequest: PullRequest): Promise<void | MergeResult> {
    const {name: repoName, owner} = this.config.github;

    // Attempt to retrieve the active LTS branches to be included in the selection.
    let ltsBranches: {branchName: string; version: semver.SemVer}[] = [];
    try {
      assertValidReleaseConfig(this.config);
      const ltsBranchesFromNpm = await fetchLongTermSupportBranchesFromNpm(this.config.release);
      ltsBranches = ltsBranchesFromNpm.active.map(({name, version}) => ({
        branchName: name,
        version,
      }));
    } catch {
      Log.warn(
        'Unable to determine the active LTS branches as a release config is not set for this repo.',
      );
    }

    // Gather the current active release trains.
    const {latest, next, releaseCandidate} = await ActiveReleaseTrains.fetch({
      name: repoName,
      nextBranchName: getNextBranchName(this.config.github),
      owner,
      api: this.git.github,
    });

    // Collate the known active branches into a single list.
    const activeBranches: {branchName: string; version: semver.SemVer}[] = [
      next,
      latest,
      ...ltsBranches,
    ];
    if (releaseCandidate !== null) {
      // Since the next version will always be the primary github branch rather than semver, the RC
      // branch should be included as the second item in the list.
      activeBranches.splice(1, 0, releaseCandidate);
    }

    const {selectedBranches, confirm} = await prompt([
      {
        type: 'checkbox',
        default: pullRequest.targetBranches,
        choices: activeBranches.map(({branchName, version}) => {
          return {
            checked: pullRequest.targetBranches.includes(branchName),
            value: branchName,
            short: branchName,
            name: `${branchName} (${version})${
              branchName === pullRequest.githubTargetBranch ? ' [Targeted via Github UI]' : ''
            }`,
          };
        }),
        message: 'Select branches to merge pull request into:',
        name: 'selectedBranches',
      },
      {
        type: 'confirm',
        default: false,
        message:
          red('!!!!!! WARNING !!!!!!!\n') +
          yellow(
            'Using manual branch selection disables protective checks provided by the merge ' +
              'tooling. This means that the merge tooling will not prevent changes which are not ' +
              'allowed for the targeted branches. Please proceed with caution.\n',
          ) +
          'Are you sure you would like to proceed with the selected branches?',
        name: 'confirm',
      },
    ]);

    if (confirm === false) {
      return {status: MergeStatus.USER_ABORTED};
    }

    // The Github Targeted branch must always be selected. It is not currently possible to make a
    // readonly selection in inquirer's checkbox.
    if (!selectedBranches.includes(pullRequest.githubTargetBranch)) {
      return {
        status: MergeStatus.FAILED,
        failure: PullRequestFailure.failedToManualSelectGithubTargetBranch(
          pullRequest.githubTargetBranch,
        ),
      };
    }

    pullRequest.targetBranches = selectedBranches;
  }
}
