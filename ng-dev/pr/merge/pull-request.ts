/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MergeTool} from './merge-tool.js';
import {
  getTargetBranchesAndLabelForPullRequest,
  PullRequestTarget,
  TargetLabelName,
} from '../common/targeting/target-label.js';
import {fetchPullRequestFromGithub} from '../common/fetch-pull-request.js';
import {FatalMergeToolError} from './failures.js';
import {ActiveReleaseTrains} from '../../release/versioning/active-release-trains.js';
import {PullRequestValidationConfig} from '../common/validation/validation-config.js';
import {assertValidPullRequest} from '../common/validation/validate-pull-request.js';
import {TEMP_PR_HEAD_BRANCH} from './strategies/strategy.js';

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
  /** List of branches this PR must be cherry picked into. */
  cherryPickTargetBranches: string[];
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
}

/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 *
 * @throws {PullRequestValidationFailure} A pull request failure if the pull request does not
 *   pass the validation.
 * @throws {FatalMergeToolError} A fatal error might be thrown when e.g. the pull request
 *   does not exist upstream.
 */
export async function loadAndValidatePullRequest(
  {git, config}: MergeTool,
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

  if (config.pullRequest.__noTargetLabeling) {
    // If there is no target labeling, we always target the main branch and treat the PR as
    // if it has been labeled with the `target: major` label (allowing for all types of changes).
    target = {branches: [config.github.mainBranchName], labelName: TargetLabelName.MAJOR};
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

  await assertValidPullRequest(prData, validationConfig, config, activeReleaseTrains, target);

  const requiredBaseSha =
    config.pullRequest.requiredBaseCommits &&
    config.pullRequest.requiredBaseCommits[githubTargetBranch];
  const needsCommitMessageFixup =
    !!config.pullRequest.commitMessageFixupLabel &&
    labels.includes(config.pullRequest.commitMessageFixupLabel);
  const hasCaretakerNote =
    !!config.pullRequest.caretakerNoteLabel &&
    labels.includes(config.pullRequest.caretakerNoteLabel);

  /** Number of commits in the pull request. */
  const commitCount = prData.commits.totalCount;
  /**
   * SHA for the first commit the pull request is based on.
   *
   * Typically we would be able to rely on referencing the the base revision as the temprorary
   * pull request head commmit minus the number of commits in the pull request. This is not
   * always the case when we rebase the PR with autosquash where the amount of commits could
   * change. We avoid this issue around this by parsing the base revision so that we are able
   * to reference a specific SHA before a autosquash rebase could be performed.
   */
  const baseSha = git.run(['rev-parse', `${TEMP_PR_HEAD_BRANCH}~${commitCount}`]).stdout.trim();
  /* Git revision range that matches the pull request commits. */
  const revisionRange = `${baseSha}..${TEMP_PR_HEAD_BRANCH}`;

  return {
    url: prData.url,
    prNumber,
    labels,
    requiredBaseSha,
    githubTargetBranch,
    needsCommitMessageFixup,
    commitCount,
    baseSha,
    revisionRange,
    hasCaretakerNote,
    targetBranches: target.branches,
    cherryPickTargetBranches: target.branches.filter((b) => b !== githubTargetBranch),
    title: prData.title,
  };
}
