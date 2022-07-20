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

/** Assert the pull request has a signed CLA. */
export const signedClaValidation = createPullRequestValidation(
  {name: 'assertSignedCla', canBeForceIgnored: false},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(pullRequest: PullRequestFromGithub) {
    const passing = getStatusesForPullRequest(pullRequest).statuses.some(({name, status}) => {
      return name === 'cla/google' && status === PullRequestStatus.PASSING;
    });

    if (!passing) {
      throw this._createError('CLA is not signed by the contributor.');
    }
  }
}
