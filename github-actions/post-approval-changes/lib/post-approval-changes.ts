import * as core from '@actions/core';
import {context} from '@actions/github';
import {PullRequestEvent} from '@octokit/webhooks-types';
import {Octokit, RestEndpointMethodTypes} from '@octokit/rest';
import {
  ANGULAR_ROBOT,
  utils,
} from '../../utils.js';

/** Allowlist of known Google owned robot accounts. */
export const googleOwnedRobots = ['angular-robot'];

export async function postApprovalChangesMain() {
  let repoClient: Octokit | null = null;
  let googlersOrgClient: Octokit | null = null;

  try {
    const repoToken = await utils.getAuthTokenFor(ANGULAR_ROBOT, context.repo);
    const googlersOrgToken = await getGooglersOrgInstallationToken();

    repoClient = new Octokit({auth: repoToken});

    if (googlersOrgToken !== null) {
      googlersOrgClient = new Octokit({auth: googlersOrgToken});
    }

    await runPostApprovalChangesAction(googlersOrgClient ?? repoClient, repoClient);
  } finally {
    if (googlersOrgClient !== null) {
      await utils.revokeActiveInstallationToken(googlersOrgClient);
    }
    if (repoClient !== null) {
      await utils.revokeActiveInstallationToken(repoClient);
    }
  }
}

export async function getGooglersOrgInstallationToken(): Promise<string | null> {
  try {
    // Use the `.github` repo from googlers to get an installation that has access to the googlers
    // user membership.
    return await utils.getAuthTokenFor(ANGULAR_ROBOT, {
      org: 'googlers',
    });
  } catch (e) {
    console.error('Could not retrieve installation token for `googlers` org.');
    console.error(e);
  }

  return null;
}

export async function runPostApprovalChangesAction(
  membershipCheckClient: Octokit,
  repoClient: Octokit,
): Promise<void> {
  if (context.eventName !== 'pull_request_target') {
    throw Error('This action can only run for with pull_request_target events');
  }
  const {pull_request: pr} = context.payload as PullRequestEvent;

  const actionUser = context.actor;
  const isReopened = (context.payload as PullRequestEvent).action === 'reopened';

  // For reopened events, we must verify commit freshness regardless of who clicked Reopen,
  // preventing a bypass when an external PR with commits pushed while closed is reopened by a Googler.
  if (!isReopened) {
    if (await utils.isGooglerOrgMember(actionUser, membershipCheckClient)) {
      core.info(
        'Action performed by an account in the Googler Github Org, skipping as post approval changes are allowed.',
      );
      return;
    }

    if (googleOwnedRobots.includes(actionUser)) {
      core.info(
        'Action performed by a robot owned by Google, skipping as post approval changes are allowed.',
      );
      return;
    }
  }

  console.debug(`Requested Reviewers: ${pr.requested_reviewers.join(', ')}`);
  console.debug(`Requested Teams:     ${pr.requested_teams.join(', ')}`);

  if ([...pr.requested_reviewers, ...pr.requested_teams].length > 0) {
    core.info('Skipping check as there are still pending reviews.');
    return;
  }

  /** The repository and owner for the pull request. */
  const {repo, owner} = context.issue;
  /** The number of the pull request. */
  const pull_number = context.issue.number;

  /** List of reviews for the pull request. */
  const allReviews = await repoClient.paginate(repoClient.pulls.listReviews, {
    owner,
    pull_number,
    repo,
  });
  /** Set of reviewers whose latest review has already been processed. */
  const knownReviewers = new Set<string>();
  /** The latest approving reviews for each reviewer on the pull request. */
  const reviews: RestEndpointMethodTypes['pulls']['listReviews']['response']['data'] = [];

  // Use new instance of array before reversing it.
  for (let review of allReviews.concat().reverse()) {
    // Ignore comment-only reviews as they do not affect approval status on GitHub.
    if (review.state === 'COMMENTED') {
      continue;
    }
    /** The username of the reviewer, since all reviewers are users this should always exist. */
    const user = review.user?.login;
    if (!user || knownReviewers.has(user)) {
      continue;
    }
    // Only consider reviews by Googlers for this check.
    if (!(await utils.isGooglerOrgMember(user, membershipCheckClient))) {
      continue;
    }
    knownReviewers.add(user);
    reviews.push(review);
  }

  console.group('Latest Reviews by Reviewer:');
  for (let review of reviews) {
    console.log(`${review.user?.login} - ${review.state}`);
  }
  console.groupEnd();

  if (reviews.length === 0) {
    core.info('Skipping check as their are no reviews on the pull request.');
    return;
  }

  if (reviews.find((review) => review.state !== 'APPROVED')) {
    core.info('Skipping check as there are still non-approved review states.');
    return;
  }

  if (reviews.find((review) => review.commit_id === pr.head.sha)) {
    core.info(`Passing check as at least one reviews is for the latest commit on the pull request`);
    return;
  }

  const reviewersToRerequest = Array.from(
    new Set(
      reviews
        .map((r) => r.user?.login)
        .filter((login): login is string => Boolean(login) && login !== pr.user?.login),
    ),
  );

  if (reviewersToRerequest.length > 0) {
    core.info(`Requesting a new review from ${reviewersToRerequest.join(', ')}`);
    await repoClient.pulls.requestReviewers({
      owner,
      pull_number,
      repo,
      reviewers: reviewersToRerequest,
    });
  }
}
