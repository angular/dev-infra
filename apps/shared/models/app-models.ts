import {getDoc, getFirestore, doc, DocumentData} from 'firebase/firestore';
import {BaseModel, Constructor, FirestoreReference, fromFirestoreReference} from './base';

// Import all of the models for the module and decorate all of them for App usage.
import * as models from './index';
Object.values(models).forEach(forApp);
export * from './index';

/** Map of known Model instances maped by their firestore reference. */
const instances = new Map<FirestoreReference<unknown>, Promise<unknown>>();

/**
 * Decorating function for models, allowing them to be used in Firebase function environment leveraging Firestore.
 * Models decorated with this function use `firebase/firestore` for reading and writing to Firestore.
 */
function forApp<
  FirebaseModel extends DocumentData,
  TBase extends Constructor<BaseModel<FirebaseModel>>,
>(model: TBase) {
  /** The converter object for performing conversions in and out of Firestore. */
  const converter = {
    fromFirestore: (snapshot: any) => {
      return new model(snapshot.data());
    },
    toFirestore: (model: any) => {
      return model.data;
    },
  };

  /**
   * Class method to get the converter object, ensuring that the converter returned is always
   * the converter from the specific class definition rather than a parent class.
   */
  model.prototype.getConverter = function () {
    return converter;
  };

  /**
   * Gets the model referenced by the provided FirestoreReference, returning the same reference
   * as previously queried if the instance cache finds an entry.
   */
  model.prototype.getByReference = function (ref: FirestoreReference<TBase>) {
    if (!instances.has(ref)) {
      instances.set(
        ref,
        getDoc(doc(getFirestore(), fromFirestoreReference(ref)).withConverter(converter)),
      );
    }
    return instances.get(ref);
  };
}
