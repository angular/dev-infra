import {StatusEvent} from '@octokit/webhooks-types';
import {firestore} from 'firebase-admin';
// TODO(josephperrott): Remove usage of FirestoreReference and fromFirestoreReference.
import {
  Status,
  FirestoreReference,
  fromFirestoreReference,
} from '../../shared/models/server-models.js';

export async function handleStatusEvent(event: StatusEvent) {
  const {getFirestoreRefForGithubModel, fromGithub} = Status.getGithubHelpers();
  /** The pull request model for the pull request status data. */
  const status = fromGithub(event);
  /** FirestoreReference for the pull request status. */
  const firestoreRef = getFirestoreRefForGithubModel(event) as FirestoreReference<Status>;
  /** The Firestore document reference for the pull request status. */
  const docRef = firestore().doc(fromFirestoreReference(firestoreRef));

  await docRef.set(Status.getConverter().toFirestore(status));
}
