import {PullRequestEvent} from '@octokit/webhooks-types';
import {firestore} from 'firebase-admin';
// TODO(josephperrott): Remove usage of FirestoreReference and fromFirestoreReference.
import {
  PullRequest,
  FirestoreReference,
  fromFirestoreReference,
} from '../../shared/models/server-models.js';

export async function handlePullRequestEvent({pull_request}: PullRequestEvent) {
  const {getFirestoreRefForGithubModel, fromGithub} = PullRequest.getGithubHelpers();
  /** The pull request model for the pull request data. */
  const pullRequest = fromGithub(pull_request);
  /** FirestoreReference for the pull request. */
  const firestoreRef = getFirestoreRefForGithubModel(
    pull_request,
  ) as FirestoreReference<PullRequest>;
  /** The Firestore document reference for the pull request. */
  const docRef = firestore().doc(fromFirestoreReference(firestoreRef));

  await docRef.set(pullRequest.data);
}
