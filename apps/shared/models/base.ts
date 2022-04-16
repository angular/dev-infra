export type Constructor<T> = new (...args: any[]) => T;

/** Base class for all models to inherit from. */
export abstract class BaseModel<T> {
  data!: T;
  /** The symbol marker for the function which decorated the model for either app or server. */
  private decoratedFor!: symbol;

  /** The data as stored in Firestore. */
  constructor(data: T) {
    if (this.decoratedFor === null) {
      throw Error();
    }
    this.setData(data);
  }

  protected setData(data: T) {
    this.data = data;
  }

  static getByReference<T>(ref: FirestoreReference<T>): TypeFromFirestoreRef<typeof ref> {
    return this.prototype.getByReference(ref);
  }

  protected getByReference(ref: FirestoreReference<T>): T {
    throw Error('This was not implemented');
  }

  /** A function to get the converter for the model */
  static getConverter() {
    return this.prototype.getConverter();
  }
  protected getConverter(): {
    fromFirestore: (snapshot: any) => T;
    toFirestore: (model: any) => any;
  } {
    throw Error('This was not implemented');
  }

  /** Set the decoratedFor value on the prototype of the class. */
  static decoratedFor(decoratedFor: symbol) {
    this.prototype.decoratedForFunc(this, decoratedFor);
  }

  /**
   * Set the decoratedFor method for the prototype of the class, if has not already been set.
   */
  private decoratedForFunc<T>({prototype: base, name}: typeof BaseModel, decoratedFor: symbol) {
    if (base.decoratedFor) {
      throw Error(`Attempted to mark the decorator for '${name}' after it already had been set`);
    }
    base.decoratedFor = decoratedFor;
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
