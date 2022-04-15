import {firestore} from 'firebase-admin';
import {DocumentData} from '@google-cloud/firestore';

import {
  BaseModel,
  GithubBaseModel,
  FirestoreReference,
  fromFirestoreReference,
  Constructor,
} from './base';

export {FirestoreReference, fromFirestoreReference};

// Import all of the models for the module and decorate all of them for App usage.
import * as models from './index';
Object.values(models).forEach(forServer);
export * from './index';

/**
 * Decorating function for models, allowing them to be used in Firebase function environment
 * leveraging Firestore.  Models decorated with this function use `firebase-admin/firestore` for
 * reading and writing to Firestore.
 */
function forServer<
  GithubModel extends {},
  FirebaseModel extends DocumentData,
  TBase extends Constructor<BaseModel<FirebaseModel> | GithubBaseModel<FirebaseModel>>,
>(Base: TBase) {
  /** The converter object for performing conversions in and out of Firestore. */
  const converter = {
    fromFirestore: (snapshot: any) => {
      return new Base(snapshot.data());
    },
    toFirestore: (model: any) => {
      return model.data;
    },
  };

  /**
   * Class method to get the converter object, ensuring that the converter returned is always
   * the converter from the specific class definition rather than a parent class.
   */
  Base.prototype.getConverter = function () {
    return converter;
  };

  /**
   * Gets the model referenced by the provided FirestoreReference.
   */
  Base.prototype.getByReference = function (ref: FirestoreReference<TBase>) {
    return firestore().doc(fromFirestoreReference(ref)).withConverter(converter);
  };

  // Because the parameter provided is a class constructor, we can safely also interact with the
  // static members.
  const GithubBase = Base as unknown as typeof GithubBaseModel;
  if (GithubBase.githubHelpers !== undefined) {
    /**
     * The github helper functions for converter Github payload models into our models.
     */
    Base.prototype.getGithubHelpers = function () {
      return {
        fromGithub(model: GithubModel) {
          return new Base(GithubBase.githubHelpers.fromGithub(model));
        },
        getFirestoreRefForGithubModel(model: GithubModel) {
          return firestore().doc(
            fromFirestoreReference(GithubBase.githubHelpers.buildRefString(model)),
          );
        },
      };
    };
  }
}
