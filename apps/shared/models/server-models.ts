import {firestore} from 'firebase-admin';
import {
  QueryDocumentSnapshot as AdminQueryDocumentSnapshot,
  FirestoreDataConverter as AdminFirestoreDataConverter,
  DocumentReference as AdminDocumentReference,
  DocumentData as AdminDocumentData,
} from '@google-cloud/firestore';

import {GithubUser} from './user';
import {GithubLabel} from './label';
import {GithubMilestone} from './milestone';
import {GithubPullRequest} from './pull-request';
import {GithubStatus} from './status';
import {GithubTeam} from './team';

import {Constructor, BaseModel, GithubHelperFunctions, GithubBaseModel} from './base';
import {GithubCheck} from './check';
export const User = forServer(GithubUser, GithubUser.githubHelpers);
export const Label = forServer(GithubLabel, GithubLabel.githubHelpers);
export const Milestone = forServer(GithubMilestone, GithubMilestone.githubHelpers);
export const PullRequest = forServer(GithubPullRequest, GithubPullRequest.githubHelpers);
export const Status = forServer(GithubStatus, GithubStatus.githubHelpers);
export const Team = forServer(GithubTeam, GithubTeam.githubHelpers);
export const Check = forServer(GithubCheck, GithubCheck.githubHelpers);

/** A model which has been setup for usage in a Firebase functions (firebase-admin) environment. */
type WithAdminFirestoreDataConverter<Model> = Model & {
  converter: AdminFirestoreDataConverter<Model>;
};

/**
 * A model which has been setup for usage in a Firebase functions (firebase-admin) environment,
 * with additional expectation/support for converting from a Github webhook payload.
*/
type WithAdminFirestoreDataConverterAndGithub<Model, GithubModel> = Model & {
  converter: AdminFirestoreDataConverter<Model> & {
    fromGithub: (model: GithubModel) => Model;
    getFirestoreRefForGithubModel: (model: GithubModel) => AdminDocumentReference;
  };
};

/**
 * Mixin for models, allowing them to be used in Firebase function environment leveraging Firestore.
 * This mixin provides the `converter` object used for reading and writing to Firestore, using the
 * `firebase-admin/firestore` types.
 *
 * If a GithubHelper function object is provided, creates a class containing converters or Firestore
 * and Github.
 */
export function forServer<
  FirebaseModel extends AdminDocumentData,
  Base extends Constructor<BaseModel<FirebaseModel>>,
>(base: Base): WithAdminFirestoreDataConverter<Base>;
export function forServer<
  FirebaseModel extends AdminDocumentData,
  Base extends Constructor<GithubBaseModel<FirebaseModel>>,
  GithubModel extends {},
>(
  base: Base,
  github: GithubHelperFunctions<GithubModel, FirebaseModel>,
): WithAdminFirestoreDataConverterAndGithub<Base, GithubModel>;
export function forServer<
  FirebaseModel extends AdminDocumentData,
  Base extends Constructor<BaseModel<FirebaseModel>>,
  GithubModel extends {},
>(base: Base, github?: GithubHelperFunctions<GithubModel, FirebaseModel>) {
  return class Model extends base {
    static converter = {
      fromFirestore(snapshot: AdminQueryDocumentSnapshot) {
        return new Model(snapshot.data());
      },
      toFirestore(base: Model) {
        return base.data;
      },
      fromGithub: github ? (model: GithubModel) => new Model(github.fromGithub(model)) : undefined,
      getFirestoreRefForGithubModel: github
        ? (model: GithubModel) =>
            firestore().doc(github.buildRefString(model)).withConverter(Model.converter)
        : undefined,
    };
  };
}
