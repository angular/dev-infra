import {PullRequestEvent} from '@octokit/webhooks-types';
import {PullRequest} from '../../shared/models/server-models';

export async function handlePullRequestEvent(event: PullRequestEvent) {
  const docRef = PullRequest.converter.getFirestoreRefForGithubModel(event.pull_request);
  const pullRequest = PullRequest.converter.fromGithub(event.pull_request);
  await docRef.set(pullRequest);
}
