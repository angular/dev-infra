/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Commit} from '../../../commit-message/parse';
import {TargetLabel, TargetLabelName} from '../targeting/target-label';
import {breakingChangeLabel, PullRequestConfig} from '../../config';
import {PullRequestFailure} from './failures';
import {Log, red} from '../../../utils/logging';
import {
  getStatusesForPullRequest,
  PullRequestFromGithub,
  PullRequestStatus,
} from '../fetch-pull-request';
import {ActiveReleaseTrains} from '../../../release/versioning';

/**
 * Assert the commits provided are allowed to merge to the provided target label,
 * throwing an error otherwise.
 * @throws {PullRequestFailure}
 */
export function assertChangesAllowForTargetLabel(
  commits: Commit[],
  label: TargetLabel,
  config: PullRequestConfig,
  releaseTrains: ActiveReleaseTrains,
  labelsOnPullRequest: string[],
) {
  if (
    !!config.commitMessageFixupLabel &&
    labelsOnPullRequest.some((name) => matchesPattern(name, config.commitMessageFixupLabel))
  ) {
    Log.debug(
      'Skipping commit message target label validation because the commit message fixup label is ' +
        'applied.',
    );
    return;
  }

  /**
   * List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
   * scopes in patch branches, no breaking changes in minor or patch changes.
   */
  const exemptedScopes = config.targetLabelExemptScopes || [];
  /** List of commits which are subject to content requirements for the target label. */
  commits = commits.filter((commit) => !exemptedScopes.includes(commit.scope));
  const hasBreakingChanges = commits.some((commit) => commit.breakingChanges.length !== 0);
  const hasDeprecations = commits.some((commit) => commit.deprecations.length !== 0);
  const hasFeatureCommits = commits.some((commit) => commit.type === 'feat');
  switch (label.name) {
    case TargetLabelName.MAJOR:
      break;
    case TargetLabelName.MINOR:
      if (hasBreakingChanges) {
        throw PullRequestFailure.hasBreakingChanges(label);
      }
      break;
    case TargetLabelName.RELEASE_CANDIDATE:
    case TargetLabelName.LONG_TERM_SUPPORT:
    case TargetLabelName.PATCH:
      if (hasBreakingChanges) {
        throw PullRequestFailure.hasBreakingChanges(label);
      }
      if (hasFeatureCommits) {
        throw PullRequestFailure.hasFeatureCommits(label);
      }
      // Deprecations should not be merged into RC, patch or LTS branches.
      // https://semver.org/#spec-item-7. Deprecations should be part of
      // minor releases, or major releases according to SemVer.
      if (hasDeprecations && !releaseTrains.isFeatureFreeze()) {
        throw PullRequestFailure.hasDeprecations(label);
      }
      break;
    default:
      Log.warn(red('WARNING: Unable to confirm all commits in the pull request are'));
      Log.warn(red(`eligible to be merged into the target branch: ${label.name}`));
      break;
  }
}

/**
 * Assert the pull request has the proper label for breaking changes if there are breaking change
 * commits, and only has the label if there are breaking change commits.
 * @throws {PullRequestFailure}
 */
export function assertCorrectBreakingChangeLabeling(
  commits: Commit[],
  pullRequestLabels: string[],
) {
  /** Whether the PR has a label noting a breaking change. */
  const hasLabel = pullRequestLabels.includes(breakingChangeLabel);
  //** Whether the PR has at least one commit which notes a breaking change. */
  const hasCommit = commits.some((commit) => commit.breakingChanges.length !== 0);

  if (!hasLabel && hasCommit) {
    throw PullRequestFailure.missingBreakingChangeLabel();
  }

  if (hasLabel && !hasCommit) {
    throw PullRequestFailure.missingBreakingChangeCommit();
  }
}

/**
 * Assert the pull request is pending, not closed, merged or in draft.
 * @throws {PullRequestFailure} if the pull request is not pending.
 */
export function assertPendingState(pullRequest: PullRequestFromGithub) {
  if (pullRequest.isDraft) {
    throw PullRequestFailure.isDraft();
  }
  switch (pullRequest.state) {
    case 'CLOSED':
      throw PullRequestFailure.isClosed();
    case 'MERGED':
      throw PullRequestFailure.isMerged();
  }
}

/**
 * Assert the pull request has all necessary CLAs signed.
 * @throws {PullRequestFailure} if the pull request is missing a necessary CLA signature.
 */
export function assertSignedCla(pullRequest: PullRequestFromGithub) {
  const passing = getStatusesForPullRequest(pullRequest).statuses.some(({name, status}) => {
    return name === 'cla/google' && status === PullRequestStatus.PASSING;
  });

  if (passing) {
    return;
  }

  throw PullRequestFailure.claUnsigned();
}

/**
 * Assert the pull request has been marked ready for merge by the author.
 * @throws {PullRequestFailure} if the pull request is missing the merge ready label.
 */
export function assertMergeReady(pullRequest: PullRequestFromGithub, config: PullRequestConfig) {
  if (pullRequest.labels.nodes.some(({name}) => matchesPattern(name, config.mergeReadyLabel))) {
    return true;
  }
  throw PullRequestFailure.notMergeReady();
}

/**
 * Assert the pull request has been marked ready for merge by the author.
 * @throws {PullRequestFailure} if the pull request is missing the merge ready label.
 */
export function assertPassingCi(pullRequest: PullRequestFromGithub) {
  const {combinedStatus} = getStatusesForPullRequest(pullRequest);
  if (combinedStatus === PullRequestStatus.PENDING) {
    throw PullRequestFailure.pendingCiJobs();
  }
  if (combinedStatus === PullRequestStatus.FAILING) {
    throw PullRequestFailure.failingCiJobs();
  }
}

// TODO: Remove need to export this pattern matching utility.
/** Checks whether the specified value matches the given pattern. */
export function matchesPattern(value: string, pattern: RegExp | string): boolean {
  return typeof pattern === 'string' ? value === pattern : pattern.test(value);
}
