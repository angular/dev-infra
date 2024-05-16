/**
 * @license
 * Copyright Google LLC
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
// TODO: update typings to make sure portability is properly handled for windows build.
export const passingCiValidation = createPullRequestValidation(
  {name: 'assertPassingCi', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(pullRequest: PullRequestFromGithub) {
    const {combinedStatus, statuses} = getStatusesForPullRequest(pullRequest);

    // TODO(josephperrott): Find a way to not need to do this kind of detection.
    // Because its not possible to determine if workflow is pending approval or if all checks and
    // statuses have run, we use the `CI / lint (pull_request)` as a marker for if the expected
    // checks have run already.  If they have not yet run, we mark the combined status as missing.
    if (statuses.find((status) => status.name === 'lint') === undefined) {
      throw this._createError(
        'Pull request is missing expected status checks. Check the pull request for pending workflows',
      );
    }
    if (combinedStatus === PullRequestStatus.PENDING) {
      throw this._createError('Pull request has pending status checks.');
    }
    if (combinedStatus === PullRequestStatus.FAILING) {
      throw this._createError('Pull request has failing status checks.');
    }
  }
}
