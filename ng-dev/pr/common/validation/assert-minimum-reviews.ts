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
import {Log} from '../../../utils/logging.js';
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
      const key = reviewerLogin || `__anonymous_${anonymousIndex++}`;
      if (reviewerLogin && requestedReviewers.has(reviewerLogin) && state === 'APPROVED') {
        latestMemberReviews.delete(key);
        continue;
      }
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
      const exemptionResult = await this._checkExemptionFromHeadShaApproval(pullRequest, gitClient);
      if (!exemptionResult.isExempt) {
        if (exemptionResult.cannotVerifyGooglerOrg) {
          Log.warn(
            'Unable to verify membership in the "googlers" GitHub organization with the current ' +
              'GitHub token. Ensure your GitHub account is a member of the "googlers" ' +
              'organization (http://go/github) and that your token includes the "read:org" or ' +
              '"repo" scope.',
          );
          throw this._createError(
            `Pull request cannot be merged because the latest commit (${pullRequest.headRefOid}) has not been approved by a team member, and the current GitHub token cannot verify "googlers" organization membership. Please submit a review approving the latest commit or configure a token with "googlers" organization access.`,
          );
        }
        throw this._createError(
          `Pull request cannot be merged because the latest commit (${pullRequest.headRefOid}) has not been approved by a team member.`,
        );
      }
    }
  }

  private async _checkExemptionFromHeadShaApproval(
    pullRequest: PullRequestFromGithub,
    gitClient?: AuthenticatedGitClient,
  ): Promise<{isExempt: boolean; cannotVerifyGooglerOrg: boolean}> {
    const authorLogin = pullRequest.author?.login;
    if (!authorLogin) {
      return {isExempt: false, cannotVerifyGooglerOrg: false};
    }
    const authorCheck = await this._verifyGooglerOrRobot(authorLogin, gitClient);
    if (!authorCheck.isGooglerOrRobot) {
      return {isExempt: false, cannotVerifyGooglerOrg: authorCheck.cannotVerifyGooglerOrg};
    }

    const verifiedLogins = new Set<string>([authorLogin, 'web-flow', ...googleOwnedRobots]);
    for (const node of pullRequest.commits?.nodes ?? []) {
      const commit = node?.commit;
      const authorLoginFromCommit = commit?.author?.user?.login;
      const committerLoginFromCommit = commit?.committer?.user?.login;
      if (!authorLoginFromCommit || !committerLoginFromCommit) {
        return {isExempt: false, cannotVerifyGooglerOrg: false};
      }
      for (const commitLogin of [authorLoginFromCommit, committerLoginFromCommit]) {
        if (verifiedLogins.has(commitLogin)) {
          continue;
        }
        const commitCheck = await this._verifyGooglerOrRobot(commitLogin, gitClient);
        if (!commitCheck.isGooglerOrRobot) {
          return {isExempt: false, cannotVerifyGooglerOrg: commitCheck.cannotVerifyGooglerOrg};
        }
        verifiedLogins.add(commitLogin);
      }
    }
    return {isExempt: true, cannotVerifyGooglerOrg: false};
  }

  private async _verifyGooglerOrRobot(
    username: string,
    gitClient?: AuthenticatedGitClient,
  ): Promise<{isGooglerOrRobot: boolean; cannotVerifyGooglerOrg: boolean}> {
    if (googleOwnedRobots.includes(username)) {
      return {isGooglerOrRobot: true, cannotVerifyGooglerOrg: false};
    }
    if (!gitClient) {
      return {isGooglerOrRobot: false, cannotVerifyGooglerOrg: false};
    }
    const {isMember, canVerifyOrg} = await githubMacros.verifyGooglerOrgMembership(
      gitClient.github,
      authorLoginOrUser(username),
    );
    return {
      isGooglerOrRobot: isMember,
      cannotVerifyGooglerOrg: !canVerifyOrg,
    };
  }
}

function authorLoginOrUser(username: string): string {
  return username;
}
