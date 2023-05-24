/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Assert the pull request is pending, not closed, merged or in draft. */
export const pendingStateValidation = createPullRequestValidation<Validation>(
  {name: 'assertPending', canBeForceIgnored: false},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(pullRequest: PullRequestFromGithub) {
    if (pullRequest.isDraft) {
      throw this._createError('Pull request is still a draft.');
    }
    switch (pullRequest.state) {
      case 'CLOSED':
        throw this._createError('Pull request is already closed.');
      case 'MERGED':
        throw this._createError('Pull request is already merged.');
    }
  }
}
