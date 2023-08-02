/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Assert the pull request has completed all requested reviews. */
export const completedReviewsValidation = createPullRequestValidation(
  {name: 'assertCompletedReviews', canBeForceIgnored: false},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(pullRequest: PullRequestFromGithub) {
    console.log(pullRequest.title);
    const totalCount = pullRequest.reviewRequests.totalCount;
    if (totalCount !== 0) {
      throw this._createError(
        `Pull request cannot be merged with pending reviews, it current has ${totalCount} pending review(s)`,
      );
    }
  }
}
