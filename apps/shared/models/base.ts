
/**
 * Because it is less expensive to store strings than Firestore references, with no change in the
 * value it provides, we have this local type to express this usage.
 */
export type FirestoreReference<T> = string;

export type Constructor<T> = new (...args: any[]) => T;

export interface GithubHelperFunctions<GithubModel, FirebaseModel> {
  fromGithub: (m: GithubModel) => FirebaseModel;
  buildRefString: (m: GithubModel) => string;
}

export abstract class BaseModel<T> {
  /** The data as stored in Firestore. */
  constructor(protected data: T) {}
}

export abstract class GithubBaseModel<T> extends BaseModel<T> {
  /** Helper functions for translating Github objects to Firestore. */
  protected static githubHelpers: GithubHelperFunctions<any, any> | undefined;
}

