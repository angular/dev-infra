import {components} from '@octokit/openapi-types';

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type Commit = components['schemas']['commit'];

export type PartialCommit = DeepPartial<Commit>;
