/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullRequestConfig} from '../../config/index.js';
import {
  getStatusesForPullRequest,
  PullRequestFromGithub,
  PullRequestStatus,
} from '../fetch-pull-request.js';
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
    const notPassing: string[] = [];

    for (const enforced of config.requiredStatuses) {
      const status = statuses.find((s) => s.name === enforced.name && s.type === enforced.type);

      if (status === undefined) {
        missing.push(enforced.name);
      } else if (status.status !== PullRequestStatus.PASSING) {
        notPassing.push(enforced.name);
      }
    }

    if (missing.length > 0) {
      throw this._createError(
        `Required statuses are missing on the pull request (${missing.join(', ')}).`,
      );
    }

    if (notPassing.length > 0) {
      throw this._createError(
        `Required statuses are not passing on the pull request (${notPassing.join(', ')}).`,
      );
    }
  }
}
