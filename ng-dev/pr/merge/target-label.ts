/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MergeConfig, TargetLabel} from './config';
import {getTargetLabels} from './defaults/labels';
import {matchesPattern} from './string-pattern';

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
export async function getTargetLabelFromPullRequest(
  config: Pick<MergeConfig, 'noTargetLabeling'>,
  labels: string[],
): Promise<TargetLabel> {
  if (config.noTargetLabeling) {
    throw Error('This repository does not use target labels');
  }

  const targetLabels = await getTargetLabels();
  /** List of discovered target labels for the PR. */
  const matches = [];
  for (const label of labels) {
    const match = targetLabels.find(({pattern}) => matchesPattern(label, pattern));
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
