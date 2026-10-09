import type {RestEndpointMethodTypes} from '@octokit/rest';

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type Commit = RestEndpointMethodTypes['repos']['getCommit']['response']['data'];

export type PartialCommit = DeepPartial<Commit>;
