/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as Octokit from '@octokit/rest';

import {PullRequestFailure} from './failures';
import {GitClient} from './git';
import {matchesPattern} from './string-pattern';
import {getBranchesFromTargetLabel, getTargetLabelFromPullRequest} from './target-label';
import {PullRequestMergeTask} from './task';

/** Interface that describes a pull request. */
export interface PullRequest {
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
}

/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 */
export async function loadAndValidatePullRequest(
    {git, config}: PullRequestMergeTask, prNumber: number,
    ignoreNonFatalFailures = false): Promise<PullRequest|PullRequestFailure> {
  const prData = await fetchPullRequestFromGithub(git, prNumber);

  if (prData === null) {
    return PullRequestFailure.notFound();
  }

  const labels = prData.labels.map(l => l.name);

  if (!labels.some(name => matchesPattern(name, config.mergeReadyLabel))) {
    return PullRequestFailure.notMergeReady();
  }
  if (!labels.some(name => matchesPattern(name, config.claSignedLabel))) {
    return PullRequestFailure.claUnsigned();
  }

  const targetLabel = getTargetLabelFromPullRequest(config, labels);
  if (targetLabel === null) {
    return PullRequestFailure.noTargetLabel();
  }

  const {data: {state}} =
      await git.api.repos.getCombinedStatusForRef({...git.remoteParams, ref: prData.head.sha});

  if (state === 'failure' && !ignoreNonFatalFailures) {
    return PullRequestFailure.failingCiJobs();
  }
  if (state === 'pending' && !ignoreNonFatalFailures) {
    return PullRequestFailure.pendingCiJobs();
  }

  const githubTargetBranch = prData.base.ref;
  const requiredBaseSha =
      config.requiredBaseCommits && config.requiredBaseCommits[githubTargetBranch];
  const needsCommitMessageFixup = !!config.commitMessageFixupLabel &&
      labels.some(name => matchesPattern(name, config.commitMessageFixupLabel));

  return {
    prNumber,
    labels,
    requiredBaseSha,
    githubTargetBranch,
    needsCommitMessageFixup,
    title: prData.title,
    targetBranches: getBranchesFromTargetLabel(targetLabel, githubTargetBranch),
    commitCount: prData.commits,
  };
}

/** Fetches a pull request from Github. Returns null if an error occurred. */
async function fetchPullRequestFromGithub(
    git: GitClient, prNumber: number): Promise<Octokit.PullsGetResponse|null> {
  try {
    const result = await git.api.pulls.get({...git.remoteParams, pull_number: prNumber});
    return result.data;
  } catch (e) {
    // If the pull request could not be found, we want to return `null` so
    // that the error can be handled gracefully.
    if (e.status === 404) {
      return null;
    }
    throw e;
  }
}

/** Whether the specified value resolves to a pull request. */
export function isPullRequest(v: PullRequestFailure|PullRequest): v is PullRequest {
  return (v as PullRequest).targetBranches !== undefined;
}
