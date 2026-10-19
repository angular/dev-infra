/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import semver from 'semver';
import {bold, green, Log, red, yellow} from '../../utils/logging.js';

import {PullRequestConfig, PullRequestValidationConfig} from '../config/index.js';
import {
  getCaretakerNoteFromComments,
  getCaretakerNotePromptMessage,
  getMergeResultsSummary,
  getMultiPullRequestSummary,
  getTargetedBranchesConfirmationPromptMessage,
  getTargetedBranchesMessage,
  PullRequestMergeResult,
} from './messages.js';
import {loadAndValidatePullRequest, PullRequest} from './pull-request.js';
import {fetchPullRequestCommentsFromGithub} from '../common/fetch-pull-request.js';
import {GithubApiMergeStrategy} from './strategies/api-merge.js';
import {AutosquashMergeStrategy} from './strategies/autosquash-merge.js';
import {MergeStrategy} from './strategies/strategy.js';
import {GithubConfig, NgDevConfig} from '../../utils/config.js';
import {assertValidReleaseConfig} from '../../release/config/index.js';
import {
  ActiveReleaseTrains,
  fetchLongTermSupportBranchesFromNpm,
  getNextBranchName,
} from '../../release/versioning/index.js';
import {
  FatalMergeToolError,
  MergeConflictsFatalError,
  PullRequestValidationError,
  UserAbortedMergeToolError,
} from './failures.js';
import {
  InvalidTargetBranchError,
  InvalidTargetLabelError,
} from '../common/targeting/target-label.js';
import {createPullRequestValidationConfig} from '../common/validation/validation-config.js';
import {Prompt} from '../../utils/prompt.js';
import {isGithubApiError} from '../../utils/git/github.js';

export type {PullRequestMergeResult} from './messages.js';

export interface PullRequestMergeFlags {
  branchPrompt: boolean;
  forceManualBranches: boolean;
  dryRun: boolean;
  ignorePendingReviews: boolean;
  waitForValidations: boolean;
}

/** Extracts a human-readable failure message from known error types. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof InvalidTargetBranchError || error instanceof InvalidTargetLabelError) {
    return error.failureMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

const defaultPullRequestMergeFlags: PullRequestMergeFlags = {
  branchPrompt: true,
  forceManualBranches: false,
  dryRun: false,
  ignorePendingReviews: false,
  waitForValidations: false,
};

/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
export class MergeTool {
  private flags: PullRequestMergeFlags;

  constructor(
    public config: NgDevConfig<{
      pullRequest: PullRequestConfig;
      github: GithubConfig;
    }>,
    public git: AuthenticatedGitClient,
    flags: Partial<PullRequestMergeFlags>,
  ) {
    // Update flags property with the provided flags values as patches to the default flag values.
    this.flags = {...defaultPullRequestMergeFlags, ...flags};
  }

  /**
   * Merges the given pull request and pushes it upstream.
   * @param prNumber Pull request that should be merged.
   * @param partialValidationConfig Pull request validation config. Can be modified to skip
   *   certain non-fatal validations.
   */
  async merge(
    prNumber: number,
    partialValidationConfig: PullRequestValidationConfig,
  ): Promise<void> {
    const results = await this.mergeMany([prNumber], partialValidationConfig);
    const result = results.find((r) => r.prNumber === prNumber);
    if (!result || result.status !== 'success') {
      throw new FatalMergeToolError(result?.failureReason ?? 'Failed to merge pull request.');
    }
  }

  /**
   * Merges multiple pull requests in batch.
   *
   * Pull requests are validated upfront and displayed in a combined summary.
   * After a single confirmation prompt, pull requests are merged sequentially.
   * If a pull request encounters a merge conflict or failure, it is skipped so
   * that subsequent pull requests can still be merged.
   *
   * @param prNumbers Pull requests that should be merged.
   * @param partialValidationConfig Pull request validation config.
   * @returns List of results for each processed pull request.
   */
  async mergeMany(
    prNumbers: number[],
    partialValidationConfig: PullRequestValidationConfig,
  ): Promise<PullRequestMergeResult[]> {
    if (this.git.hasUncommittedChanges()) {
      throw new FatalMergeToolError(
        'Local working repository not clean. Please make sure there are ' +
          'no uncommitted changes.',
      );
    }

    if (this.git.isShallowRepo()) {
      throw new FatalMergeToolError(
        `Unable to perform merge in a local repository that is configured as shallow.\n` +
          `Please convert the repository to a complete one by syncing with upstream.\n` +
          `https://git-scm.com/docs/git-fetch#Documentation/git-fetch.txt---unshallow`,
      );
    }

    const uniquePrNumbers = Array.from(new Set(prNumbers));

    if (this.flags.forceManualBranches && uniquePrNumbers.length > 1) {
      throw new FatalMergeToolError(
        'Manual branch selection (--force-manual-branches) cannot be used when merging multiple pull requests.',
      );
    }

    await this.confirmMergeAccess();

    const validationConfig = createPullRequestValidationConfig({
      ...this.config.pullRequest.validators,
      ...partialValidationConfig,
      waitIfPending: this.flags.waitForValidations,
    });

    const results: PullRequestMergeResult[] = [];
    const validPullRequests: PullRequest[] = [];

    // Phase 1: Load and validate each pull request upfront.
    for (const prNumber of uniquePrNumbers) {
      try {
        const pullRequest = await this.loadAndValidatePullRequest(prNumber, validationConfig);
        await this.assertPullRequestValidation(pullRequest);

        if (pullRequest.hasCaretakerNote) {
          pullRequest.caretakerNote = await this.getCaretakerNote(pullRequest);
        }

        if (this.flags.forceManualBranches) {
          await this.updatePullRequestTargetedBranchesFromPrompt(pullRequest);
        }

        validPullRequests.push(pullRequest);
      } catch (e) {
        if (e instanceof UserAbortedMergeToolError) {
          throw e;
        }

        if (isGithubApiError(e) && e.status === 401) {
          throw e;
        }

        if (
          e instanceof FatalMergeToolError ||
          e instanceof InvalidTargetBranchError ||
          e instanceof InvalidTargetLabelError ||
          isGithubApiError(e)
        ) {
          const reason = getErrorMessage(e);
          Log.error(`Could not load PR #${prNumber}: ${bold(reason)}`);
          results.push({
            prNumber,
            status: 'failed',
            failureReason: reason,
          });
        } else {
          throw e;
        }
      }
    }

    if (validPullRequests.length === 0) {
      Log.error('No pull requests are ready to be merged.');
      Log.info();
      if (results.length > 0) {
        Log.info(getMergeResultsSummary(results, this.flags.dryRun));
        Log.info();
      }
      return results;
    }

    // Phase 2: Display aggregated summary of changes and request single confirmation.
    Log.info();
    Log.info(getMultiPullRequestSummary(validPullRequests));
    Log.info();

    if (
      !this.flags.dryRun &&
      this.flags.branchPrompt &&
      !(await Prompt.confirm({message: getTargetedBranchesConfirmationPromptMessage()}))
    ) {
      throw new UserAbortedMergeToolError();
    }

    // Branch or revision that is currently checked out so that we can switch back to
    // it once the pull request has been merged.
    const previousBranchOrRevision = this.git.getCurrentBranchOrRevision();

    // Phase 3: Merge each valid PR sequentially.
    for (const pullRequest of validPullRequests) {
      const strategy = this.getMergeStrategy(pullRequest);

      try {
        await strategy.prepare(pullRequest);
        await strategy.check(pullRequest);

        if (!this.flags.dryRun) {
          await strategy.merge(pullRequest);
        }

        results.push({
          prNumber: pullRequest.prNumber,
          status: 'success',
          targetBranches: pullRequest.targetBranches,
        });
      } catch (e) {
        if (e instanceof UserAbortedMergeToolError) {
          throw e;
        }

        let reason = 'Unknown error';
        if (e instanceof MergeConflictsFatalError) {
          reason = `Merge conflicts detected on target branches: ${e.failedBranches.join(', ')}`;
          Log.error(red(`  ✘  PR #${pullRequest.prNumber} cannot be merged: ${reason}`));
        } else if (
          isGithubApiError(e) &&
          e.status === 405 &&
          e.message.startsWith('Repository rule violations found')
        ) {
          reason =
            'Repository Rule Violation (ensure you have been placed in the expected caretaking group)';
          Log.error(red(`  ✘  Repository Rule Violation for PR #${pullRequest.prNumber}.`));
          Log.error(
            '     This typically indicates that you are not currently a member of the expected',
          );
          Log.error(
            '     group for merge permissions in this repository. Have you been placed in the',
          );
          Log.error('     expected caretaking group?');
          Log.debug('Github API request failed: ' + bold(e.message));
        } else if (isGithubApiError(e)) {
          if (e.status === 401) {
            throw e;
          }
          reason = `GitHub API error: ${e.message}`;
          Log.error(red(`  ✘  PR #${pullRequest.prNumber} cannot be merged: ${reason}`));
        } else if (e instanceof FatalMergeToolError) {
          reason = e.message;
          Log.error(red(`  ✘  PR #${pullRequest.prNumber} cannot be merged: ${reason}`));
        } else {
          throw e;
        }

        results.push({
          prNumber: pullRequest.prNumber,
          status: 'failed',
          failureReason: reason,
          targetBranches: pullRequest.targetBranches,
        });
      } finally {
        this.git.runGraceful(['rebase', '--abort']);
        this.git.runGraceful(['cherry-pick', '--abort']);
        this.git.runGraceful(['reset', '--hard']);
        this.git.runGraceful(['checkout', '-f', previousBranchOrRevision]);
        await strategy.cleanup(pullRequest);
      }
    }

    if (this.flags.dryRun) {
      Log.info(green(`  ✓  Exiting due to dry run mode.`));
    }

    // Phase 4: Output summary of results, preserving the original input PR order.
    results.sort(
      (a, b) => uniquePrNumbers.indexOf(a.prNumber) - uniquePrNumbers.indexOf(b.prNumber),
    );

    Log.info();
    Log.info(getMergeResultsSummary(results, this.flags.dryRun));
    Log.info();

    return results;
  }

  /**
   * Modifies the pull request in place with new target branches based on user
   * selection from the available active branches.
   */
  private async updatePullRequestTargetedBranchesFromPrompt(
    pullRequest: PullRequest,
  ): Promise<void> {
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

    const selectedBranches = await Prompt.checkbox({
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
    });
    const confirmation = await Prompt.confirm({
      default: false,
      message:
        red('!!!!!! WARNING !!!!!!!\n') +
        yellow(
          'Using manual branch selection disables protective checks provided by the merge ' +
            'tooling. This means that the merge tooling will not prevent changes which are not ' +
            'allowed for the targeted branches. Please proceed with caution.\n',
        ) +
        'Are you sure you would like to proceed with the selected branches?',
    });

    if (confirmation === false) {
      throw new UserAbortedMergeToolError();
    }

    // The Github Targeted branch must always be selected. It is not currently possible
    // to make a readonly selection in inquirer's checkbox.
    if (!selectedBranches.includes(pullRequest.githubTargetBranch)) {
      throw new FatalMergeToolError(
        `Pull Requests must merge into their targeted Github branch. If this branch (${pullRequest.githubTargetBranch}) ` +
          'should not be included, please change the targeted branch via the Github UI.',
      );
    }

    pullRequest.targetBranches = selectedBranches;
  }

  /**
   * If the pull request has a caretaker note applied, raise awareness by prompting
   * the caretaker. The caretaker can then decide to proceed or abort the merge.
   */
  async checkCaretakerNoteConfirmation(pullRequest: PullRequest): Promise<void> {
    if (!pullRequest.hasCaretakerNote) {
      return;
    }

    const caretakerNote = await this.getCaretakerNote(pullRequest);
    pullRequest.caretakerNote = caretakerNote;

    if (
      !(await Prompt.confirm({
        message: getCaretakerNotePromptMessage(pullRequest, caretakerNote),
      }))
    ) {
      throw new UserAbortedMergeToolError();
    }
  }

  /**
   * Searches the comments on the pull request for a single caretaker note.
   * Returns the matching comment if exactly one is found, or undefined if
   * none or multiple are found or if fetching fails.
   */
  async getCaretakerNote(pullRequest: PullRequest): Promise<string | undefined> {
    try {
      const comments = await fetchPullRequestCommentsFromGithub(this.git, pullRequest.prNumber);
      if (comments !== null) {
        return getCaretakerNoteFromComments(comments) ?? undefined;
      }
    } catch (e) {
      Log.debug(`Failed to fetch pull request comments for caretaker note: ${e}`);
    }
    return undefined;
  }

  async confirmMergeAccess() {
    if (this.git.userType === 'user') {
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
        throw new FatalMergeToolError(hasOauthScopes.error);
      }
      return;
    } else {
      // TODO(josephperrott): Find a way to check access of the installation without using a JWT.
      Log.debug('Assuming correct access because this a bot account.');
    }
  }

  /** Loads and validates the specified pull request. */
  async loadAndValidatePullRequest(
    prNumber: number,
    validationConfig: PullRequestValidationConfig,
  ): Promise<PullRequest> {
    return loadAndValidatePullRequest(this, prNumber, validationConfig);
  }

  /**
   * Asserts that a pull request does not have fatal validation failures.
   *
   * Non-fatal validation failures are permitted and included as warnings in the
   * pull request summary, to be confirmed by the user in the single confirmation prompt.
   *
   * @throws {PullRequestValidationError} If a fatal validation check fails.
   */
  async assertPullRequestValidation(pullRequest: PullRequest): Promise<void> {
    if (pullRequest.validationFailures.length === 0) {
      return;
    }

    if (pullRequest.validationFailures.some((failure) => !failure.canBeForceIgnored)) {
      Log.error(
        `Pull request #${pullRequest.prNumber} did not pass one or more validation checks. Error:`,
      );

      for (const failure of pullRequest.validationFailures) {
        Log.error(` -> ${bold(failure.message)}`);
      }
      Log.info();

      Log.debug('Discovered a fatal error, which cannot be forced');
      throw new PullRequestValidationError(
        pullRequest.validationFailures.map((f) => f.message).join('; '),
      );
    }
  }

  /** Gets the merge strategy to use for the pull request. */
  getMergeStrategy(pullRequest: PullRequest): MergeStrategy {
    return this.config.pullRequest.githubApiMerge
      ? new GithubApiMergeStrategy(this.git, this.config.pullRequest.githubApiMerge)
      : new AutosquashMergeStrategy(this.git);
  }
}
