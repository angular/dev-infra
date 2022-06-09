/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullRequestConfig} from '../../config';
import {getTargetLabelsForActiveReleaseTrains} from './labels';
import {GithubConfig} from '../../../utils/config';
import {Commit} from '../../../commit-message/parse';
import {assertChangesAllowForTargetLabel} from '../validation/validations';
import {PullRequestFailure} from '../validation/failures';
import {GithubClient} from '../../../utils/git/github';
import {ActiveReleaseTrains} from '../../../release/versioning';

/**
 * Enum capturing available target label names in the Angular organization. A target
 * label is set on a pull request to specify where its changes should land.
 *
 * More details can be found here:
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU#heading=h.lkuypj38h15d
 */
export enum TargetLabelName {
  MAJOR = 'target: major',
  MINOR = 'target: minor',
  PATCH = 'target: patch',
  RELEASE_CANDIDATE = 'target: rc',
  LONG_TERM_SUPPORT = 'target: lts',
}

/**
 * Describes a label that can be applied to a pull request to mark into
 * which branches it should be merged into.
 */
export interface TargetLabel {
  /** Name of the target label. Needs to match with the name of the label on Github. */
  name: TargetLabelName;
  /**
   * List of branches a pull request with this target label should be merged into.
   * Can also be wrapped in a function that accepts the target branch specified in the
   * Github Web UI. This is useful for supporting labels like `target: development-branch`.
   *
   * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
   * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
   */
  branches: (githubTargetBranch: string) => string[] | Promise<string[]>;
}

/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid branch is targeted.
 */
export class InvalidTargetBranchError {
  constructor(public failureMessage: string) {}
}

/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid label has been applied to a pull request.
 */
export class InvalidTargetLabelError {
  constructor(public failureMessage: string) {}
}

/** Gets the target label from the specified pull request labels. */
export async function getMatchingTargetLabelForPullRequest(
  config: Pick<PullRequestConfig, 'noTargetLabeling'>,
  labelsOnPullRequest: string[],
  allTargetLabels: TargetLabel[],
): Promise<TargetLabel> {
  if (config.noTargetLabeling) {
    throw Error('This repository does not use target labels');
  }

  const matches: TargetLabel[] = [];

  for (const label of labelsOnPullRequest) {
    const match = allTargetLabels.find(({name}) => label === name);
    if (match !== undefined) {
      matches.push(match);
    }
  }
  if (matches.length === 1) {
    return matches[0];
  }
  if (matches.length === 0) {
    throw new InvalidTargetLabelError(
      'Unable to determine target for the PR as it has no target label.',
    );
  }
  throw new InvalidTargetLabelError(
    'Unable to determine target for the PR as it has multiple target labels.',
  );
}

/** Get the branches the pull request should be merged into. */
export async function getTargetBranchesForPullRequest(
  api: GithubClient,
  config: {pullRequest: PullRequestConfig; github: GithubConfig},
  labelsOnPullRequest: string[],
  githubTargetBranch: string,
  commits: Commit[],
): Promise<string[]> {
  if (config.pullRequest.noTargetLabeling) {
    return [config.github.mainBranchName];
  }

  // If branches are determined for a given target label, capture errors that are
  // thrown as part of branch computation. This is expected because a merge configuration
  // can lazily compute branches for a target label and throw. e.g. if an invalid target
  // label is applied, we want to exit the script gracefully with an error message.
  try {
    const {mainBranchName, name, owner} = config.github;
    const releaseTrains = await ActiveReleaseTrains.fetch({
      name,
      nextBranchName: mainBranchName,
      owner,
      api,
    });
    const targetLabels = await getTargetLabelsForActiveReleaseTrains(releaseTrains, api, config);
    const matchingLabel = await getMatchingTargetLabelForPullRequest(
      config.pullRequest,
      labelsOnPullRequest,
      targetLabels,
    );
    const targetBranches = await getBranchesFromTargetLabel(matchingLabel, githubTargetBranch);

    assertChangesAllowForTargetLabel(
      commits,
      matchingLabel,
      config.pullRequest,
      releaseTrains,
      labelsOnPullRequest,
    );

    return targetBranches;
  } catch (error) {
    if (error instanceof InvalidTargetBranchError || error instanceof InvalidTargetLabelError) {
      throw new PullRequestFailure(error.failureMessage);
    }
    throw error;
  }
}

/**
 * Gets the branches from the specified target label.
 *
 * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
 * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
 */
export async function getBranchesFromTargetLabel(
  label: TargetLabel,
  githubTargetBranch: string,
): Promise<string[]> {
  return typeof label.branches === 'function'
    ? await label.branches(githubTargetBranch)
    : await label.branches;
}
