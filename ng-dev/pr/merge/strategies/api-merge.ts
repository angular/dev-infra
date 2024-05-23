/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';
import inquirer from 'inquirer';

import {parseCommitMessage} from '../../../commit-message/parse.js';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {GithubApiMergeMethod, GithubApiMergeStrategyConfig} from '../../config/index.js';
import {PullRequest} from '../pull-request.js';

import {MergeStrategy} from './strategy.js';
import {isGithubApiError} from '../../../utils/git/github.js';
import {FatalMergeToolError, MergeConflictsFatalError} from '../failures.js';

/** Type describing the parameters for the Octokit `merge` API endpoint. */
type OctokitMergeParams = RestEndpointMethodTypes['pulls']['merge']['parameters'];

type OctokitPullRequestCommitsList =
  RestEndpointMethodTypes['pulls']['listCommits']['response']['data'];

/** Separator between commit message header and body. */
const COMMIT_HEADER_SEPARATOR = '\n\n';

/**
 * Merge strategy that primarily leverages the Github API. The strategy merges a given
 * pull request into a target branch using the API. This ensures that Github displays
 * the pull request as merged. The merged commits are then cherry-picked into the remaining
 * target branches using the local Git instance. The benefit is that the Github merged state
 * is properly set, but a notable downside is that PRs cannot use fixup or squash commits.
 */
export class GithubApiMergeStrategy extends MergeStrategy {
  constructor(
    git: AuthenticatedGitClient,
    private _config: GithubApiMergeStrategyConfig,
  ) {
    super(git);
  }

  /**
   * Merges the specified pull request via the Github API, cherry-picks the change into the other
   * target branhces and pushes the branches upstream.
   *
   * @throws {GitCommandError} An unknown Git command error occurred that is not
   *   specific to the pull request merge.
   * @throws {FatalMergeToolError} A fatal error if the merge could not be performed.
   */
  override async merge(pullRequest: PullRequest): Promise<void> {
    const {githubTargetBranch, prNumber, needsCommitMessageFixup, targetBranches} = pullRequest;
    const method = this._getMergeActionFromPullRequest(pullRequest);
    const cherryPickTargetBranches = targetBranches.filter((b) => b !== githubTargetBranch);

    const mergeOptions: OctokitMergeParams = {
      pull_number: prNumber,
      merge_method: method,
      ...this.git.remoteParams,
    };

    if (needsCommitMessageFixup) {
      // Commit message fixup does not work with other merge methods as the Github API only
      // allows commit message modifications for squash merging.
      if (method !== 'squash') {
        throw new FatalMergeToolError(
          `Unable to fixup commit message of pull request. Commit message can only be ` +
            `modified if the PR is merged using squash.`,
        );
      }
      await this._promptCommitMessageEdit(pullRequest, mergeOptions);
    }

    let mergeStatusCode: number;
    let mergeResponseMessage: string;
    let targetSha: string;

    try {
      // Merge the pull request using the Github API into the selected base branch.
      const result = await this.git.github.pulls.merge(mergeOptions);

      mergeStatusCode = result.status;
      mergeResponseMessage = result.data.message;
      targetSha = result.data.sha;
    } catch (e) {
      // Note: Github usually returns `404` as status code if the API request uses a
      // token with insufficient permissions. Github does this because it doesn't want
      // to leak whether a repository exists or not. In our case we expect a certain
      // repository to exist, so we always treat this as a permission failure.
      if (isGithubApiError(e) && (e.status === 403 || e.status === 404)) {
        throw new FatalMergeToolError('Insufficient Github API permissions to merge pull request.');
      }
      throw e;
    }

    // https://developer.github.com/v3/pulls/#response-if-merge-cannot-be-performed
    // Pull request cannot be merged due to merge conflicts.
    if (mergeStatusCode === 405) {
      throw new MergeConflictsFatalError([githubTargetBranch]);
    }
    if (mergeStatusCode !== 200) {
      throw new FatalMergeToolError(
        `Unexpected merge status code: ${mergeStatusCode}: ${mergeResponseMessage}`,
      );
    }

    // If the PR does not need to be merged into any other target branches,
    // we exit here as we already completed the merge.
    if (!cherryPickTargetBranches.length) {
      return;
    }

    // Refresh the target branch the PR has been merged into through the API. We need
    // to re-fetch as otherwise we cannot cherry-pick the new commits into the remaining
    // target branches.
    this.fetchTargetBranches([githubTargetBranch]);

    // Number of commits that have landed in the target branch. This could vary from
    // the count of commits in the PR due to squashing.
    const targetCommitsCount = method === 'squash' ? 1 : pullRequest.commitCount;

    // Cherry pick the merged commits into the remaining target branches.
    const failedBranches = await this.cherryPickIntoTargetBranches(
      `${targetSha}~${targetCommitsCount}..${targetSha}`,
      cherryPickTargetBranches,
      {
        // Commits that have been created by the Github API do not necessarily contain
        // a reference to the source pull request (unless the squash strategy is used).
        // To ensure that original commits can be found when a commit is viewed in a
        // target branch, we add a link to the original commits when cherry-picking.
        linkToOriginalCommits: true,
      },
    );

    // We already checked whether the PR can be cherry-picked into the target branches,
    // but in case the cherry-pick somehow fails, we still handle the conflicts here. The
    // commits created through the Github API could be different (i.e. through squash).
    if (failedBranches.length) {
      throw new MergeConflictsFatalError(failedBranches);
    }

    this.pushTargetBranchesUpstream(cherryPickTargetBranches);

    // Because our process brings changes into multiple branchces, we include a comment which
    // expresses all of the branches the changes were merged into.
    await this.git.github.issues.createComment({
      ...this.git.remoteParams,
      issue_number: pullRequest.prNumber,
      body: `The changes were merged into the following branches: ${targetBranches.join(', ')}`,
    });
  }

  /**
   * Prompts the user for the commit message changes. Unlike as in the autosquash merge
   * strategy, we cannot start an interactive rebase because we merge using the Github API.
   * The Github API only allows modifications to PR title and body for squash merges.
   */
  private async _promptCommitMessageEdit(
    pullRequest: PullRequest,
    mergeOptions: OctokitMergeParams,
  ) {
    const commitMessage = await this._getDefaultSquashCommitMessage(pullRequest);
    const {result} = await inquirer.prompt<{result: string}>({
      type: 'editor',
      name: 'result',
      message: 'Please update the commit message',
      default: commitMessage,
    });

    // Split the new message into title and message. This is necessary because the
    // Github API expects title and message to be passed separately.
    const [newTitle, ...newMessage] = result.split(COMMIT_HEADER_SEPARATOR);

    // Update the merge options so that the changes are reflected in there.
    mergeOptions.commit_title = `${newTitle} (#${pullRequest.prNumber})`;
    mergeOptions.commit_message = newMessage.join(COMMIT_HEADER_SEPARATOR);
  }

  /**
   * Gets a commit message for the given pull request. Github by default concatenates
   * multiple commit messages if a PR is merged in squash mode. We try to replicate this
   * behavior here so that we have a default commit message that can be fixed up.
   */
  private async _getDefaultSquashCommitMessage(pullRequest: PullRequest): Promise<string> {
    const commits = (await this._getPullRequestCommitMessages(pullRequest)).map((message) => ({
      message,
      parsed: parseCommitMessage(message),
    }));
    const messageBase = `${pullRequest.title}${COMMIT_HEADER_SEPARATOR}`;
    if (commits.length <= 1) {
      return `${messageBase}${commits[0].parsed.body}`;
    }
    const joinedMessages = commits.map((c) => `* ${c.message}`).join(COMMIT_HEADER_SEPARATOR);
    return `${messageBase}${joinedMessages}`;
  }

  /** Gets all commit messages of commits in the pull request. */
  private async _getPullRequestCommitMessages({prNumber}: PullRequest) {
    const allCommits: OctokitPullRequestCommitsList = await this.git.github.paginate(
      this.git.github.pulls.listCommits,
      {
        ...this.git.remoteParams,
        pull_number: prNumber,
      },
    );
    return allCommits.map(({commit}) => commit.message);
  }

  /** Determines the merge action from the given pull request. */
  private _getMergeActionFromPullRequest({labels}: PullRequest): GithubApiMergeMethod {
    if (this._config.labels) {
      const matchingLabel = this._config.labels.find(({pattern}) => labels.includes(pattern));
      if (matchingLabel !== undefined) {
        return matchingLabel.method;
      }
    }
    return this._config.default;
  }
}
