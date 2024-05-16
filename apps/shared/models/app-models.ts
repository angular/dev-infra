import {getDoc, getFirestore, doc, DocumentData} from 'firebase/firestore';
import {BaseModel, Constructor, FirestoreReference, fromFirestoreReference} from './base.js';

// Import all of the models for the module and decorate all of them for app use.
import * as models from './index.js';
Object.values(models).forEach(forApp);
export * from './index.js';

/**
 * Decorating function for models, allowing them to be used in Firebase function environment leveraging Firestore.
 * Models decorated with this function use `firebase/firestore` for reading and writing to Firestore.
 */
function forApp<
  FirebaseModel extends DocumentData,
  TBase extends Constructor<BaseModel<FirebaseModel>>,
>(model: TBase) {
  const staticModel = model as unknown as typeof BaseModel;
  staticModel.markAsDecorated();

  /**
   * Gets the model referenced by the provided FirestoreReference, returning the same reference
   * as previously queried if the instance cache finds an entry.
   */
  model.prototype.getByReference = function (ref: FirestoreReference<TBase>) {
    return getDoc(
      doc(getFirestore(), fromFirestoreReference(ref)).withConverter(staticModel.getConverter()),
    );
  };
}
