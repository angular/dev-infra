/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {actionLabels} from '../labels/index.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Assert the pull request is merge ready. */
export const mergeReadyValidation = createPullRequestValidation(
  {name: 'assertMergeReady', canBeForceIgnored: false},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(pullRequest: PullRequestFromGithub) {
    if (!pullRequest.labels.nodes.some(({name}) => name === actionLabels.ACTION_MERGE.name)) {
      throw this._createError('Pull request is not marked as merge ready.');
    }
  }
}
