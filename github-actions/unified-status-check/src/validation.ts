import {StatusState} from '@octokit/graphql-schema';
import {PullRequest} from './pull-request.js';

export type ValidationFunction = (pullRequest: PullRequest) => {
  state: StatusState;
  description: string;
};
