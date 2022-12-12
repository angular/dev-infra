import {PullRequest} from '../pull-request.js';
import {ValidationFunction} from '../validator.js';

export const isDraft: ValidationFunction = (pullRequest: PullRequest) => {
  if (pullRequest.isDraft) {
    return {
      description: 'Pull Request is still in draft',
      state: 'pending',
    };
  }

  return {
    description: 'Pull Request is marked ready',
    state: 'success',
  };
};
