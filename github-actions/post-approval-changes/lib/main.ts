import * as core from '@actions/core';
import {context} from '@actions/github';
import {PullRequestEvent} from '@octokit/webhooks-types';
import {Octokit} from '@octokit/rest';
import {ANGULAR_ROBOT, getAuthTokenFor, revokeActiveInstallationToken} from '../../utils.js';

/** Allow list of googlers whose pull request are allowed to include post approval changes. */
const googlers = [
  'alan-agius4',
  'alxhub',
  'amysorto',
  'AndrewKushnir',
  'andrewseguin',
  'atscott',
  'clydin',
  'crisbeto',
  'devversion',
  'dgp1130',
  'dylhunn',
  'jelbourn',
  'jessicajaniuk',
  'josephperrott',
  'madleinas',
  'MarkTechson',
  'mgechev',
  'mmalerba',
  'pkozlowski-opensource',
  'thevis',
  'twersky',
  'wagnermaciel',
  'zarend',
];

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

  if (googlers.includes(actionUser)) {
    core.info('Action performed by a googler, skipping as post approval changes are allowed.');
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
  const reviews = allReviews
    // Use new instance of array before reversing it.
    .concat()
    .reverse()
    .filter((review) => {
      /** The username of the reviewer, since all reviewers are users this should always exist. */
      const user = review.user!.login;
      // Only consider reviews by Googlers for this check.
      if (!googlers.includes(user)) {
        return false;
      }
      if (knownReviewers.has(user)) {
        return false;
      }
      knownReviewers.add(user);
      return true;
    });

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
