/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  getTargetBranchesAndLabelForPullRequest,
  PullRequestTarget,
} from '../common/targeting/target-label.js';
import {
  fetchPullRequestFromGithub,
  fetchPullRequestFilesFromGithub,
} from '../common/fetch-pull-request.js';
import {FatalMergeToolError} from './failures.js';
import {ActiveReleaseTrains} from '../../release/versioning/active-release-trains.js';
import {PullRequestValidationConfig} from '../common/validation/validation-config.js';
import {assertValidPullRequest} from '../common/validation/validate-pull-request.js';
import {TEMP_PR_HEAD_BRANCH} from './strategies/strategy.js';
import {mergeLabels} from '../common/labels/merge.js';
import {PullRequestValidationFailure} from '../common/validation/validation-failure.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {GithubConfig, NgDevConfig, CaretakerConfig, GoogleSyncConfig} from '../../utils/config.js';
import {PullRequestConfig} from '../config/index.js';
import {targetLabels} from '../common/labels/target.js';
import {G3Stats} from '../../utils/g3.js';

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
  /** Files in the pull request. */
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
  /** The SHA for the first commit the pull request is based on. */
  baseSha: string;
  /** Git revision range that matches the pull request commits. */
  revisionRange: string;
  /** A list of validation failures found for the pull request, empty if no failures are discovered. */
  validationFailures: PullRequestValidationFailure[];
  /** The SHA for the latest commit in the pull request. */
  headSha: string;
  /** A list of files included in the pull request */
  files: string[];
}

/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 *
 * @throws {FatalMergeToolError} A fatal error might be thrown when e.g. the pull request
 *   does not exist upstream.
 * @throws {InvalidTargetLabelError} Error thrown if an invalid target label is applied.
 * @throws {InvalidTargetBranchError} Error thrown if an invalid GitHub PR destination branch
 *   is selected.
 */
export async function loadAndValidatePullRequest(
  {
    git,
    config,
    googleSyncConfig,
  }: {
    git: AuthenticatedGitClient;
    config: NgDevConfig<{
      pullRequest: PullRequestConfig;
      github: GithubConfig;
      caretaker: CaretakerConfig;
    }>;
    googleSyncConfig: GoogleSyncConfig | null;
  },
  prNumber: number,
  validationConfig: PullRequestValidationConfig,
): Promise<PullRequest> {
  const prData = await fetchPullRequestFromGithub(git, prNumber);

  if (prData === null) {
    throw new FatalMergeToolError('Pull request could not be found.');
  }

  const labels = prData.labels.nodes.map((l) => l.name);
  const githubTargetBranch = prData.baseRefName;

  const {mainBranchName, name, owner} = config.github;

  // Active release trains fetched. May be `null` if e.g. target labeling is disabled
  // and the active release train information is not available/computable.
  let activeReleaseTrains: ActiveReleaseTrains | null = null;
  let target: PullRequestTarget | null = null;
  let files = await loadPullRequestFiles(git, prNumber);
  let diffStats = null;

  if (config.pullRequest.__noTargetLabeling) {
    // If there is no target labeling, we always target the main branch and treat the PR as
    // if it has been labeled with the `target: major` label (allowing for all types of changes).
    target = {branches: [config.github.mainBranchName], label: targetLabels.TARGET_MAJOR};
  } else {
    activeReleaseTrains = await ActiveReleaseTrains.fetch({
      name,
      nextBranchName: mainBranchName,
      owner,
      api: git.github,
    });

    target = await getTargetBranchesAndLabelForPullRequest(
      activeReleaseTrains,
      git.github,
      config,
      labels,
      githubTargetBranch,
    );
  }


  if (googleSyncConfig && googleSyncConfig.primitivesFilePatterns.length > 0) {
    diffStats = await G3Stats.retrieveDiffStats(git, {
      caretaker: config.caretaker,
      github: config.github,
    });
    if (diffStats === undefined) {
      throw new FatalMergeToolError('G3 diff stats could not be retrieved.');
    }
  }

  const validationFailures = await assertValidPullRequest(
    prData,
    files,
    diffStats,
    validationConfig,
    config,
    activeReleaseTrains,
    target,
    googleSyncConfig,
  );

  const requiredBaseSha =
    config.pullRequest.requiredBaseCommits &&
    config.pullRequest.requiredBaseCommits[githubTargetBranch];
  const needsCommitMessageFixup = labels.includes(mergeLabels.MERGE_FIX_COMMIT_MESSAGE.name);
  const hasCaretakerNote = labels.includes(mergeLabels.MERGE_CARETAKER_NOTE.name);

  // The parent of the first commit in a PR is the base SHA.
  const baseSha = prData.baseCommitInfo.nodes[0].commit.parents.nodes[0].oid;

  // Typically we would be able to rely on referencing the base revision as the pull
  // request head commit minus the number of commits in the pull request. This is not always
  // reliable when we rebase e.g. the PR with autosquash where the amount of commits could
  // change. We avoid this issue around this by using the resolved base revision so that we are
  // able to reference an explicit SHA before a autosquash rebase could be performed.
  const revisionRange = `${baseSha}..${TEMP_PR_HEAD_BRANCH}`;

  return {
    url: prData.url,
    prNumber,
    labels,
    requiredBaseSha,
    githubTargetBranch,
    needsCommitMessageFixup,
    baseSha,
    revisionRange,
    hasCaretakerNote,
    validationFailures,
    targetBranches: target.branches,
    title: prData.title,
    commitCount: prData.commits.totalCount,
    headSha: prData.headRefOid,
    files,
  };
}

/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 *
 * @throws {FatalMergeToolError} A fatal error might be thrown when e.g. the pull request
 *   does not exist upstream.
 * @throws {InvalidTargetLabelError} Error thrown if an invalid target label is applied.
 * @throws {InvalidTargetBranchError} Error thrown if an invalid GitHub PR destination branch
 *   is selected.
 */
export async function loadPullRequestFiles(
  git: AuthenticatedGitClient,
  prNumber: number,
): Promise<string[]> {
  const files = await fetchPullRequestFilesFromGithub(git, prNumber);
  if (files === null) {
    throw new FatalMergeToolError('Pull request could not be found.');
  }
  return files?.flatMap((x) => x.nodes).map((p) => p.path);
}
