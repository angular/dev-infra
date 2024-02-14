/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  pullRequestHasValidTestedComment,
  pullRequestRequiresTGP,
  PullRequestFromGithub,
} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Assert the pull request has passing enforced statuses. */
// TODO: update typings to make sure portability is properly handled for windows build.
export const enforceTestedValidation = createPullRequestValidation(
  {name: 'assertEnforceTested', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(pullRequest: PullRequestFromGithub) {
    if (!pullRequestRequiresTGP(pullRequest)) {
      return;
    }

    if (pullRequestHasValidTestedComment(pullRequest)) {
      return;
    }

    throw this._createError(
      `Pull Request requires a TGP and does not have one. Either run a TGP or specify the PR is fully tested by adding a comment with "TESTED=[reason]".`,
    );
  }
}
