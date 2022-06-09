export type Constructor<T> = new (...args: any[]) => T;

/** Base class for all models to inherit from. */
export abstract class BaseModel<T> {
  data!: T;
  /**
   * Whether the model is decorated, undecorated models will be undefined.
   * Because this value is set by the static properties, we cannot initialize a value for it.
   * */
  private isDecorated: true | undefined;

  /** The data as stored in Firestore. */
  constructor(data: T) {
    if (this.isDecorated !== true) {
      throw Error();
    }
    this.data = data;
    this.setData(data);
  }

  protected setData(data: T) {}

  static getByReference<T>(ref: FirestoreReference<T>): Promise<TypeFromFirestoreRef<typeof ref>> {
    return this.prototype.getByReference(ref);
  }

  protected getByReference(ref: FirestoreReference<T>): T {
    throw Error('This was not implemented');
  }

  /** A function to get the converter for the model */
  static getConverter<T>() {
    return this.prototype.getConverter<T>(this as unknown as Constructor<T>);
  }

  /**
   * Class method to get the converter object, ensuring that the converter returned is always
   * the converter from the specific class definition rather than a parent class.
   */
  private getConverter<SubModelT>(modelCtor: Constructor<SubModelT>): {
    fromFirestore: (snapshot: any) => SubModelT;
    toFirestore: (model: any) => any;
  } {
    return {
      fromFirestore: (snapshot: any) => {
        return new modelCtor(snapshot.data());
      },
      toFirestore: (modelInstance: any) => {
        return modelInstance.data;
      },
    };
  }

  /**
   * Set the decoratedFor value for the prototype of the class, if has not already been set.
   */
  static markAsDecorated() {
    if (this.prototype.isDecorated) {
      throw Error(
        `Attempted to mark the decorator for '${this.name}' after it already had been set`,
      );
    }
    this.prototype.isDecorated = true;
  }
}

/** Github helper functions to be defined in all classes inheriting from GithubBaseModel. */
export interface GithubHelperFunctions<Model, GithubModel, FirebaseModel> {
  fromGithub: (m: GithubModel) => FirebaseModel;
  buildRefString: (m: GithubModel) => FirestoreReference<Model>;
}

/** Base class for all Github based models to inherit from. */
export abstract class GithubBaseModel<T> extends BaseModel<T> {
  /** Helper functions for translating Github objects to Firestore. */
  static githubHelpers: GithubHelperFunctions<any, any, any>;

  static getGithubHelpers<GithubModel = any>() {
    return this.prototype.getGithubHelpers<GithubModel>();
  }

  protected getGithubHelpers<GithubModel>(): {
    fromGithub: (model: GithubModel) => T;
    getFirestoreRefForGithubModel: (model: GithubModel) => FirestoreReference<T>;
  } {
    throw Error('This was not implemented');
  }
}

/**
 * Because it is less expensive to store strings than Firestore references, with no change in the
 * value it provides, we have this local type to express this usage.
 */
export type FirestoreReference<T> = {
  // ensures this "Reference" string is not passed around as "string" accidentally.
  __eefirestoreReference: true;
  __eereferencedType: T;
};

export type TypeFromFirestoreRef<T> = T extends FirestoreReference<infer ModelType> ? ModelType : T;

export function fromFirestoreReference<T>(ref: FirestoreReference<T>): string {
  return ref as unknown as string;
}

export function toFirestoreReference<T>(ref: string) {
  return ref as unknown as FirestoreReference<T>;
}
