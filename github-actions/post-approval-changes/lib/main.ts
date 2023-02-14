import * as core from '@actions/core';
import {context} from '@actions/github';
import {PullRequestEvent} from '@octokit/webhooks-types';
import {Octokit, RestEndpointMethodTypes} from '@octokit/rest';
import {ANGULAR_ROBOT, getAuthTokenFor, revokeActiveInstallationToken} from '../../utils.js';

/** Allowlist of known Google owned robot accounts. */
const googleOwnedRobots = ['angular-robot'];

async function main() {
  let installationClient: Octokit | null = null;

  try {
    const token = await getAuthTokenFor(ANGULAR_ROBOT);
    installationClient = new Octokit({auth: token});

    await runPostApprovalChangesAction(installationClient);
  } finally {
    if (installationClient !== null) {
      await revokeActiveInstallationToken(installationClient);
    }
  }
}

async function runPostApprovalChangesAction(client: Octokit): Promise<void> {
  if (context.eventName !== 'pull_request_target') {
    throw Error('This action can only run for with pull_request_target events');
  }
  const {pull_request: pr} = context.payload as PullRequestEvent;

  const actionUser = context.actor;

  if (await isGooglerOrgMember(client, actionUser)) {
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
  const allReviews = await client.paginate(client.pulls.listReviews, {owner, pull_number, repo});
  /** Set of reviewers whose latest review has already been processed. */
  const knownReviewers = new Set<string>();
  /** The latest approving reviews for each reviewer on the pull request. */
  const reviews: RestEndpointMethodTypes['pulls']['listReviews']['response']['data'] = [];

  // Use new instance of array before reversing it.
  for (let review of allReviews.concat().reverse()) {
    /** The username of the reviewer, since all reviewers are users this should always exist. */
    const user = review.user!.login;
    if (knownReviewers.has(user)) {
      continue;
    }
    // Only consider reviews by Googlers for this check.
    if (!(await isGooglerOrgMember(client, user))) {
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

  const reviewToRerequest = reviews[0];
  core.info(`Requesting a new review from ${reviewToRerequest.user!.login}`);
  await client.pulls.requestReviewers({
    owner,
    pull_number,
    repo,
    reviewers: [reviewToRerequest.user!.login],
  });
}

/** Set of membership lookup results, used as cache for lookups. */
const isGooglerOrgMemberCache = new Map<string, boolean>([]);

async function isGooglerOrgMember(client: Octokit, username: string): Promise<boolean> {
  if (isGooglerOrgMemberCache.has(username)) {
    return isGooglerOrgMemberCache.get(username)!;
  }
  return await client.orgs
    .checkMembershipForUser({org: 'googler', username})
    .then(
      ({status}) => (status as number) === 204,
      () => false,
    )
    .then((result) => {
      isGooglerOrgMemberCache.set(username, result);
      return result;
    });
}

// Only run if the action is executed in a repository with is in the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
// Runs triggered via 'workflow_dispatch' are also allowed to run.
if (context.repo.owner === 'angular') {
  main().catch((e: Error) => {
    console.error(e);
    core.setFailed(e.message);
  });
} else {
  core.warning(
    'Post Approvals changes check was skipped as this action is only meant to run in repos ' +
      'belonging to the Angular organization.',
  );
}
