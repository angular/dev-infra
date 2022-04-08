import {firestore} from 'firebase-admin';
import {
  QueryDocumentSnapshot,
  FirestoreDataConverter,
  DocumentReference,
  DocumentData,
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
export type User = GithubUser;
export const Label = forServer(GithubLabel, GithubLabel.githubHelpers);
export type Label = GithubLabel;
export const Milestone = forServer(GithubMilestone, GithubMilestone.githubHelpers);
export type Milestone = GithubMilestone;
export const PullRequest = forServer(GithubPullRequest, GithubPullRequest.githubHelpers);
export type PullRequest = GithubPullRequest;
export const Status = forServer(GithubStatus, GithubStatus.githubHelpers);
export type Status = GithubStatus;
export const Team = forServer(GithubTeam, GithubTeam.githubHelpers);
export type Team = GithubTeam;
export const Check = forServer(GithubCheck, GithubCheck.githubHelpers);
export type Check = GithubCheck;

/** A converter object for conversions to and from Github and Firestore. */
interface FirestoreDataConverterWithGithub<Model, GithubModel>
  extends FirestoreDataConverter<Model> {
  fromGithub: (model: GithubModel) => Model;
  getFirestoreRefForGithubModel: (model: GithubModel) => DocumentReference;
}

/** Constructor for a server model. */
interface ServerModelCtor<T extends DocumentData, ModelT> {
  new (data: T): ModelT;
  converter: FirestoreDataConverter<ModelT>;
}

/** Constructor for a server model. */
interface ServerModelCtorWithGithub<T extends DocumentData, ModelT, GithubModel> {
  new (data: T): ModelT;
  converter: FirestoreDataConverterWithGithub<ModelT, GithubModel>;
}

/**
 * Mixin for models, allowing them to be used in Firebase function environment leveraging Firestore.
 * This mixin provides the `converter` object used for reading and writing to Firestore, using the
 * `firebase-admin/firestore` types.
 *
 * If a GithubHelper function object is provided, creates a class containing converters or Firestore
 * and Github.
 */
export function forServer<
  FirebaseModel extends DocumentData,
  TBase extends Constructor<BaseModel<FirebaseModel>>,
>(base: TBase): ServerModelCtor<FirebaseModel, InstanceType<TBase>>;
export function forServer<
  FirebaseModel extends DocumentData,
  TBase extends Constructor<GithubBaseModel<FirebaseModel>>,
  GithubModel extends {},
>(
  Base: TBase,
  github: GithubHelperFunctions<GithubModel, FirebaseModel>,
): ServerModelCtorWithGithub<FirebaseModel, InstanceType<TBase>, GithubModel>;
export function forServer<
  FirebaseModel extends DocumentData,
  TBase extends Constructor<GithubBaseModel<FirebaseModel>>,
  GithubModel extends {},
>(Base: TBase, github?: GithubHelperFunctions<GithubModel, FirebaseModel>) {
  class Model extends Base {
    static converter:
      | FirestoreDataConverter<Model>
      | FirestoreDataConverterWithGithub<Model, GithubModel> = {
      fromFirestore(snapshot: QueryDocumentSnapshot<FirebaseModel>) {
        return new Model(snapshot.data());
      },
      toFirestore(model: Model) {
        return model.data;
      },
    };
  }

  if (github) {
    Model.converter = {
      ...Model.converter,
      fromGithub(model: GithubModel) {
        return new Model(github.fromGithub(model));
      },
      getFirestoreRefForGithubModel(model: GithubModel) {
        return firestore().doc(github.buildRefString(model)).withConverter(Model.converter);
      },
    };
    return Model as unknown as ServerModelCtorWithGithub<
      FirebaseModel,
      InstanceType<TBase>,
      GithubModel
    >;
  }

  return Model as unknown as ServerModelCtor<FirebaseModel, InstanceType<TBase>>;
}
