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

/** Assert the pull request has a signed CLA. */
// TODO: update typings to make sure portability is properly handled for windows build.
export const signedClaValidation = createPullRequestValidation(
  // CLA check can be force-ignored but the caretaker needs to make sure
  // the target pull requests has a signed CLA or is authored by another Googler.
  {name: 'assertSignedCla', canBeForceIgnored: true},
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
