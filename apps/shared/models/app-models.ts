import {DocumentData, FirestoreDataConverter, QueryDocumentSnapshot} from 'firebase/firestore';
import {GithubUser} from './user';
import {GithubLabel} from './label';
import {GithubMilestone} from './milestone';
import {GithubPullRequest} from './pull-request';
import {GithubStatus} from './status';
import {GithubCheck} from './check';
import {GithubTeam} from './team';
import {Constructor, BaseModel} from './base';

/** A model which has been setup for usage in a web app environment. */
type WithFirestoreDataConverter<Model> = Model & {
  converter: FirestoreDataConverter<Model>;
};

export const User = forApp(GithubUser);
export const Label = forApp(GithubLabel);
export const Milestone = forApp(GithubMilestone);
export const PullRequest = forApp(GithubPullRequest);
export const Status = forApp(GithubStatus);
export const Team = forApp(GithubTeam);
export const Check = forApp(GithubCheck);

/**
 * Mixin for models, allowing them to be used in web app environments leveraging Firestore. This
 * mixin provides the `converter` object used for reading and writing to Firestore, using the
 * `firebase/firestore` types.
 */
export function forApp<
  FirebaseModel extends DocumentData,
  Base extends Constructor<BaseModel<FirebaseModel>>,
>(base: Base): WithFirestoreDataConverter<Base>;
export function forApp<
  FirebaseModel extends DocumentData,
  Base extends Constructor<BaseModel<FirebaseModel>>,
>(base: Base) {
  return class Model extends base {
    static converter: FirestoreDataConverter<Model> = {
      fromFirestore(snapshot: QueryDocumentSnapshot) {
        return new Model(snapshot.data());
      },
      toFirestore(base: Model) {
        return base.data;
      },
    };
  };
}
