import {LabelEvent} from '@octokit/webhooks-types';
import {firestore} from 'firebase-admin';
// TODO(josephperrott): Remove usage of FirestoreReference and fromFirestoreReference.
import {
  Label,
  FirestoreReference,
  fromFirestoreReference,
} from '../../shared/models/server-models.js';

export async function handleLabelEvent(event: LabelEvent) {
  const {getFirestoreRefForGithubModel, fromGithub} = Label.getGithubHelpers();
  /** The label model for the label data. */
  const label = fromGithub(event.label);
  /** FirestoreReference for the label. */
  const firestoreRef = getFirestoreRefForGithubModel(event) as FirestoreReference<Label>;
  /** The Firestore document reference for the label. */
  const docRef = firestore().doc(fromFirestoreReference(firestoreRef));

  if (event.action === 'deleted') {
    await docRef.delete();
  } else {
    await docRef.set(label.data);
  }
}
