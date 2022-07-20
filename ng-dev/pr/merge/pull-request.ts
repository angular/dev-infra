/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseCommitMessage} from '../../commit-message/parse.js';
import {MergeTool} from './merge-tool.js';
import {getTargetBranchesForPullRequest} from '../common/targeting/target-label.js';
import {
  assertCorrectBreakingChangeLabeling,
  assertMergeReady,
  assertPendingState,
  assertSignedCla,
  assertPassingCi,
} from '../common/validation/validations.js';
import {fetchPullRequestFromGithub} from '../common/fetch-pull-request.js';
import {FatalMergeToolError} from './failures.js';

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
 *
 * @throws {PullRequestFailure} A pull request failure if the pull request does not
 *   pass the validation.
 * @throws {FatalMergeToolError} A fatal error might be thrown when e.g. the pull request
 *   does not exist upstream.
 */
export async function loadAndValidatePullRequest(
  {git, config}: MergeTool,
  prNumber: number,
  ignoreNonFatalFailures = false,
): Promise<PullRequest> {
  const prData = await fetchPullRequestFromGithub(git, prNumber);

  if (prData === null) {
    throw new FatalMergeToolError('Pull request could not be found.');
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

  assertMergeReady(prData, config.pullRequest);
  assertSignedCla(prData);
  assertPendingState(prData);
  assertCorrectBreakingChangeLabeling(commitsInPr, labels);

  if (!ignoreNonFatalFailures) {
    assertPassingCi(prData);
  }

  const requiredBaseSha =
    config.pullRequest.requiredBaseCommits &&
    config.pullRequest.requiredBaseCommits[githubTargetBranch];
  const needsCommitMessageFixup =
    !!config.pullRequest.commitMessageFixupLabel &&
    labels.includes(config.pullRequest.commitMessageFixupLabel);
  const hasCaretakerNote =
    !!config.pullRequest.caretakerNoteLabel &&
    labels.includes(config.pullRequest.caretakerNoteLabel);

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
