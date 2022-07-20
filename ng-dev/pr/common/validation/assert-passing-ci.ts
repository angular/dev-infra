/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  getStatusesForPullRequest,
  PullRequestFromGithub,
  PullRequestStatus,
} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Assert the pull request has a passing combined CI status. */
export const passingCiValidation = createPullRequestValidation(
  {name: 'assertPassingCi', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(pullRequest: PullRequestFromGithub) {
    const {combinedStatus} = getStatusesForPullRequest(pullRequest);
    if (combinedStatus === PullRequestStatus.PENDING) {
      throw this._createError('Pull request has pending status checks.');
    }
    if (combinedStatus === PullRequestStatus.FAILING) {
      throw this._createError('Pull request has failing status checks.');
    }
  }
}
