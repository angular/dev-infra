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
export const minimumReviewsValidation = createPullRequestValidation(
  {name: 'assertMinimumReviews', canBeForceIgnored: false},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(pullRequest: PullRequestFromGithub) {
    const totalCount = pullRequest.reviews.nodes.filter(
      ({authorAssociation}) => authorAssociation === 'MEMBER',
    ).length;
    if (totalCount === 0) {
      throw this._createError(
        `Pull request cannot be merged without at least one review from a team member`,
      );
    }
  }
}
