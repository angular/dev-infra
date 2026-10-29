/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {PullRequestReviewState} from '@octokit/graphql-schema';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import githubMacros from '../../../utils/git/github-macros.js';
import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Allowlist of known Google owned robot accounts. */
export const googleOwnedRobots = ['angular-robot'];

/** Assert the pull request has completed all requested reviews. */
export const minimumReviewsValidation = createPullRequestValidation(
  {name: 'assertMinimumReviews', canBeForceIgnored: false},
  () => Validation,
);

class Validation extends PullRequestValidation {
  async assert(pullRequest: PullRequestFromGithub, gitClient?: AuthenticatedGitClient) {
    const requestedReviewers = new Set<string>(
      (pullRequest.reviewRequests?.nodes ?? [])
        .map((node) => node?.requestedReviewer?.login)
        .filter((login): login is string => Boolean(login)),
    );

    const sortedReviews = [...(pullRequest.reviews?.nodes ?? [])].sort((a, b) => {
      if (a.submittedAt && b.submittedAt) {
        return Date.parse(a.submittedAt) - Date.parse(b.submittedAt);
      }
      return 0;
    });

    const latestMemberReviews = new Map<
      string,
      PullRequestFromGithub['reviews']['nodes'][number]
    >();
    let anonymousIndex = 0;

    for (const review of sortedReviews) {
      if (review.authorAssociation !== 'MEMBER') {
        continue;
      }
      const state: PullRequestReviewState = review.state ?? 'APPROVED';
      if (state === 'COMMENTED' || state === 'PENDING') {
        continue;
      }
      const reviewerLogin = review.author?.login;
      if (reviewerLogin && requestedReviewers.has(reviewerLogin)) {
        continue;
      }
      const key = reviewerLogin || `__anonymous_${anonymousIndex++}`;
      latestMemberReviews.set(key, {...review, state});
    }

    const activeMemberReviews = Array.from(latestMemberReviews.values());

    if (activeMemberReviews.some((review) => review.state === 'CHANGES_REQUESTED')) {
      throw this._createError(
        'Pull request cannot be merged while a team member has requested changes.',
      );
    }

    const approvedMemberReviews = activeMemberReviews.filter(
      (review) => review.state === 'APPROVED',
    );

    if (approvedMemberReviews.length === 0) {
      throw this._createError(
        'Pull request cannot be merged without at least one review from a team member',
      );
    }

    const hasApprovalForHead = approvedMemberReviews.some(
      (review) => review.commit?.oid === pullRequest.headRefOid,
    );

    if (!hasApprovalForHead) {
      const isExemptAuthor = await this._isExemptFromHeadShaApproval(pullRequest, gitClient);
      if (!isExemptAuthor) {
        throw this._createError(
          `Pull request cannot be merged because the latest commit (${pullRequest.headRefOid}) has not been approved by a team member.`,
        );
      }
    }
  }

  private async _isExemptFromHeadShaApproval(
    pullRequest: PullRequestFromGithub,
    gitClient?: AuthenticatedGitClient,
  ): Promise<boolean> {
    const authorLogin = pullRequest.author?.login;
    if (!authorLogin || !(await this._isGooglerOrRobot(authorLogin, gitClient))) {
      return false;
    }
    for (const node of pullRequest.commits?.nodes ?? []) {
      const commit = node?.commit;
      for (const commitLogin of [commit?.author?.user?.login, commit?.committer?.user?.login]) {
        if (
          commitLogin &&
          commitLogin !== authorLogin &&
          commitLogin !== 'web-flow' &&
          !(await this._isGooglerOrRobot(commitLogin, gitClient))
        ) {
          return false;
        }
      }
    }
    return true;
  }

  private async _isGooglerOrRobot(
    username: string,
    gitClient?: AuthenticatedGitClient,
  ): Promise<boolean> {
    if (googleOwnedRobots.includes(username)) {
      return true;
    }
    if (!gitClient) {
      return false;
    }
    return await githubMacros.isGooglerOrgMember(gitClient.github, authorLoginOrUser(username));
  }
}

function authorLoginOrUser(username: string): string {
  return username;
}
