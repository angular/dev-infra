import {DocumentData, FirestoreDataConverter, QueryDocumentSnapshot} from 'firebase/firestore';
import {GithubUser} from './user';
import {GithubLabel} from './label';
import {GithubMilestone} from './milestone';
import {GithubPullRequest} from './pull-request';
import {GithubStatus} from './status';
import {GithubCheck} from './check';
import {GithubTeam} from './team';
import {BaseModel} from './base';

export const User = forApp(GithubUser);
export type User = GithubUser;
export const Label = forApp(GithubLabel);
export type Label = GithubLabel;
export const Milestone = forApp(GithubMilestone);
export type Milestone = GithubMilestone;
export const PullRequest = forApp(GithubPullRequest);
export type PullRequest = GithubPullRequest;
export const Status = forApp(GithubStatus);
export type Status = GithubStatus;
export const Team = forApp(GithubTeam);
export type Team = GithubTeam;
export const Check = forApp(GithubCheck);
export type Check = GithubCheck;

/** Constructor for a application model. */
interface AppModelCtor<T extends DocumentData, ModelT> {
  new (data: T): ModelT;
  converter: FirestoreDataConverter<ModelT>;
}

/**
 * Mixin for models, allowing them to be used in web app environments leveraging Firestore. This
 * mixin provides the `converter` object used for reading and writing to Firestore, using the
 * `firebase/firestore` types.
 */
function forApp<
  FirebaseModel extends DocumentData,
  TBase extends new (...args: any[]) => BaseModel<FirebaseModel>,
>(Base: TBase): AppModelCtor<FirebaseModel, InstanceType<TBase>> {
  return class Model extends Base {
    static converter = {
      fromFirestore(snapshot: QueryDocumentSnapshot<FirebaseModel>) {
        return new Model(snapshot.data());
      },
      toFirestore(model: Model) {
        return model.data;
      },
    };
  } as unknown as AppModelCtor<FirebaseModel, InstanceType<TBase>>;
}
