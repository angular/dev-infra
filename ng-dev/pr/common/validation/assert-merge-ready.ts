/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullRequestConfig} from '../../config/index.js';
import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Assert the pull request is merge ready. */
export const mergeReadyValidation = createPullRequestValidation(
  {name: 'assertMergeReady', canBeForceIgnored: false},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(pullRequest: PullRequestFromGithub, pullRequestConfig: PullRequestConfig) {
    if (!pullRequest.labels.nodes.some(({name}) => name === pullRequestConfig.mergeReadyLabel)) {
      throw this._createError('Pull request is not marked as merge ready.');
    }
  }
}
