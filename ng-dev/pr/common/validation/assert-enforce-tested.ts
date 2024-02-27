/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubClient} from '../../../utils/git/github.js';
import {isGooglerOrgMember} from '../../../utils/git/github-googlers.js';
import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';
import {requiresLabels} from '../labels/index.js';

/** Assert the pull request has passing enforced statuses. */
// TODO: update typings to make sure portability is properly handled for windows build.
export const enforceTestedValidation = createPullRequestValidation(
  {name: 'assertEnforceTested', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  async assert(pullRequest: PullRequestFromGithub, gitClient: GithubClient) {
    if (!pullRequestRequiresTGP(pullRequest)) {
      return;
    }

    if (await pullRequestHasValidTestedComment(pullRequest, gitClient)) {
      return;
    }

    // TODO(jessicajaniuk): Add the actual validation that a TGP has been run.

    throw this._createError(
      `Pull Request requires a TGP and does not have one. Either run a TGP or specify the PR is fully tested by adding a comment with "TESTED=[reason]".`,
    );
  }
}

/**
 * Checks the list of labels for the `requires: TGP` label
 */
function pullRequestRequiresTGP(pullRequest: PullRequestFromGithub): boolean {
  return pullRequest.labels.nodes.some(({name}) => name === requiresLabels.REQUIRES_TGP.name);
}

/**
 * Checks for `TESTED=[reason]` review comment on a current commit sha from a google organization member
 */
export async function pullRequestHasValidTestedComment(
  pullRequest: PullRequestFromGithub,
  gitClient: GithubClient,
): Promise<boolean> {
  for (const {commit, bodyText, author} of pullRequest.reviews.nodes) {
    if (
      commit.oid === pullRequest.headRefOid &&
      bodyText.startsWith(`TESTED=`) &&
      (await isGooglerOrgMember(gitClient, author.login))
    ) {
      return true;
    }
  }
  return false;
}
