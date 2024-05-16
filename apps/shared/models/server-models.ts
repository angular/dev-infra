import {firestore} from 'firebase-admin';
import {DocumentData} from '@google-cloud/firestore';

import {
  BaseModel,
  GithubBaseModel,
  FirestoreReference,
  fromFirestoreReference,
  Constructor,
} from './base.js';

export {FirestoreReference, fromFirestoreReference};

// Import all of the models for the module and decorate all of them for App usage.
import * as models from './index.js';
Object.values(models).forEach(forServer);
export * from './index.js';

/**
 * Decorating function for models, allowing them to be used in Firebase function environment
 * leveraging Firestore.  Models decorated with this function use `firebase-admin/firestore` for
 * reading and writing to Firestore.
 */
function forServer<
  GithubModel extends {},
  FirebaseModel extends DocumentData,
  TBase extends Constructor<BaseModel<FirebaseModel> | GithubBaseModel<FirebaseModel>>,
>(model: TBase) {
  const staticModel = model as unknown as typeof GithubBaseModel;
  staticModel.markAsDecorated();

  /**
   * Gets the model referenced by the provided FirestoreReference.
   */
  model.prototype.getByReference = async function (ref: FirestoreReference<TBase>) {
    return firestore().doc(fromFirestoreReference(ref)).withConverter(this.getConverter());
  };

  if (staticModel.githubHelpers !== undefined) {
    /**
     * The github helper functions for converter Github payload models into our models.
     */
    model.prototype.getGithubHelpers = function () {
      return {
        fromGithub(githubModel: GithubModel) {
          return new model(staticModel.githubHelpers.fromGithub(githubModel));
        },
        getFirestoreRefForGithubModel(githubModel: GithubModel) {
          return fromFirestoreReference(staticModel.githubHelpers.buildRefString(githubModel));
        },
      };
    };
  }
}
