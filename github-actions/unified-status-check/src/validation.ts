import {NormalizedState, PullRequest} from './pull-request.js';

export type ValidationFunction = (pullRequest: PullRequest) => {
  state: NormalizedState;
  description: string;
};
