/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullRequestConfig} from '../../config/index.js';
import {getStatusesForPullRequest, PullRequestFromGithub} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Assert the pull request has passing enforced statuses. */
// TODO: update typings to make sure portability is properly handled for windows build.
export const enforcedStatusesValidation = createPullRequestValidation(
  {name: 'assertEnforcedStatuses', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(pullRequest: PullRequestFromGithub, config: PullRequestConfig) {
    if (config.requiredStatuses === undefined) {
      return;
    }

    const {statuses} = getStatusesForPullRequest(pullRequest);
    const missing: string[] = [];
    const targetBranch = pullRequest.baseRefName || 'main';

    for (const enforced of config.requiredStatuses) {
      const matchingStatus = statuses.find(
        (s) => s.name === enforced.name && s.type === enforced.type,
      );
      if (
        !matchingStatus ||
        isSkippedStatusForTargetBranch(matchingStatus.description, targetBranch)
      ) {
        missing.push(enforced.name);
      }
    }

    if (missing.length > 0) {
      throw this._createError(
        `Required statuses are missing on the pull request (${missing.join(', ')}).`,
      );
    }
  }
}

function isSkippedStatusForTargetBranch(
  description: string | undefined,
  targetBranch: string,
): boolean {
  if (!description) {
    return false;
  }
  const match = description.match(
    /^Skipped\. PR does not target `?([^`]+)`? branch(?: \(targets `?([^`]+)`?\))?$/,
  );
  if (!match) {
    return false;
  }
  const [, skippedBranch, stampedTargetBranch] = match;
  if (skippedBranch === targetBranch) {
    return true;
  }
  if (stampedTargetBranch && stampedTargetBranch !== targetBranch) {
    return true;
  }
  return false;
}
