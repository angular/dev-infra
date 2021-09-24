/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseCommitMessage} from '../../commit-message/parse';
import {PullRequestFailure} from '../common/validation/failures';
import {PullRequestMergeTask} from './task';
import {getTargetBranchesForPullRequest} from '../common/targeting/target-label';
import {
  assertCorrectBreakingChangeLabeling,
  assertMergeReady,
  matchesPattern,
  assertPendingState,
  assertSignedCla,
} from '../common/validation/validations';
import {
  fetchPullRequestFromGithub,
  getStatusesForPullRequest,
  PullRequestStatus,
} from '../common/fetch-pull-request';

/** Interface that describes a pull request. */
export interface PullRequest {
  /** URL to the pull request. */
  url: string;
  /** Number of the pull request. */
  prNumber: number;
  /** Title of the pull request. */
  title: string;
  /** Labels applied to the pull request. */
  labels: string[];
  /** List of branches this PR should be merged into. */
  targetBranches: string[];
  /** Branch that the PR targets in the Github UI. */
  githubTargetBranch: string;
  /** Count of commits in this pull request. */
  commitCount: number;
  /** Optional SHA that this pull request needs to be based on. */
  requiredBaseSha?: string;
  /** Whether the pull request commit message fixup. */
  needsCommitMessageFixup: boolean;
  /** Whether the pull request has a caretaker note. */
  hasCaretakerNote: boolean;
}

/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 */
export async function loadAndValidatePullRequest(
  {git, config}: PullRequestMergeTask,
  prNumber: number,
  ignoreNonFatalFailures = false,
): Promise<PullRequest | PullRequestFailure> {
  const prData = await fetchPullRequestFromGithub(git, prNumber);

  if (prData === null) {
    return PullRequestFailure.notFound();
  }

  const labels = prData.labels.nodes.map((l) => l.name);

  /** List of parsed commits for all of the commits in the pull request. */
  const commitsInPr = prData.commits.nodes.map((n) => parseCommitMessage(n.commit.message));
  const githubTargetBranch = prData.baseRefName;

  const targetBranches = await getTargetBranchesForPullRequest(
    git.github,
    config,
    labels,
    githubTargetBranch,
    commitsInPr,
  );

  try {
    assertMergeReady(prData, config.pullRequest);
    assertSignedCla(prData);
    assertPendingState(prData);
    assertCorrectBreakingChangeLabeling(commitsInPr, labels);
  } catch (error) {
    // If the error is a pull request failure, we pass it through gracefully
    // as the tool expects such failures to be returned from the function.
    if (error instanceof PullRequestFailure) {
      return error;
    }
    throw error;
  }

  /** The combined status of the latest commit in the pull request. */
  const {combinedStatus} = getStatusesForPullRequest(prData);
  if (combinedStatus === PullRequestStatus.FAILING && !ignoreNonFatalFailures) {
    return PullRequestFailure.failingCiJobs();
  }
  if (combinedStatus === PullRequestStatus.PENDING && !ignoreNonFatalFailures) {
    return PullRequestFailure.pendingCiJobs();
  }

  const requiredBaseSha =
    config.pullRequest.requiredBaseCommits &&
    config.pullRequest.requiredBaseCommits[githubTargetBranch];
  const needsCommitMessageFixup =
    !!config.pullRequest.commitMessageFixupLabel &&
    labels.some((name) => matchesPattern(name, config.pullRequest.commitMessageFixupLabel));
  const hasCaretakerNote =
    !!config.pullRequest.caretakerNoteLabel &&
    labels.some((name) => matchesPattern(name, config.pullRequest.caretakerNoteLabel!));

  return {
    url: prData.url,
    prNumber,
    labels,
    requiredBaseSha,
    githubTargetBranch,
    needsCommitMessageFixup,
    hasCaretakerNote,
    targetBranches,
    title: prData.title,
    commitCount: prData.commits.totalCount,
  };
}

/** Whether the specified value resolves to a pull request. */
export function isPullRequest(v: PullRequestFailure | PullRequest): v is PullRequest {
  return (v as PullRequest).targetBranches !== undefined;
}
