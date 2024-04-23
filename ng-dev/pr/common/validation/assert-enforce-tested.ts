/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import githubMacros from '../../../utils/git/github-macros.js';
import {
  fetchPullRequestCommentsFromGithub,
  PullRequestFromGithub,
  PullRequestCommentsFromGithub,
} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';
import {requiresLabels} from '../labels/index.js';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';

/** Assert the pull request has passing enforced statuses. */
// TODO: update typings to make sure portability is properly handled for windows build.
export const enforceTestedValidation = createPullRequestValidation(
  {name: 'assertEnforceTested', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  async assert(pullRequest: PullRequestFromGithub, gitClient: AuthenticatedGitClient) {
    if (!pullRequestRequiresTGP(pullRequest)) {
      return;
    }

    const comments = await PullRequestComments.create(
      gitClient,
      pullRequest.number,
    ).loadPullRequestComments();

    if (await pullRequestHasValidTestedComment(comments, gitClient)) {
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

export class PullRequestComments {
  constructor(
    private git: AuthenticatedGitClient,
    private prNumber: number,
  ) {}
  /**
   * Loads the files from a given pull request.
   */
  async loadPullRequestComments(): Promise<PullRequestCommentsFromGithub[]> {
    return (await fetchPullRequestCommentsFromGithub(this.git, this.prNumber)) ?? [];
  }

  static create(git: AuthenticatedGitClient, prNumber: number) {
    return new PullRequestComments(git, prNumber);
  }
}

/**
 * Checks for `TESTED=[reason]` comment on a current commit sha from a google organization member
 */
export async function pullRequestHasValidTestedComment(
  comments: PullRequestCommentsFromGithub[],
  gitClient: AuthenticatedGitClient,
): Promise<boolean> {
  for (const {bodyText, author} of comments) {
    if (
      bodyText.startsWith(`TESTED=`) &&
      (await githubMacros.isGooglerOrgMember(gitClient.github, author.login))
    ) {
      return true;
    }
  }
  return false;
}
