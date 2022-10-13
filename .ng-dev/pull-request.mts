import {PullRequestConfig} from '../ng-dev/pr/config/index.js';

/** Configuration for interacting with pull requests in the repo. */
export const pullRequest: PullRequestConfig = {
  githubApiMerge: false,
  // Disable target labeling in the dev-infra repo as we don't have
  // any release trains and version branches.
  __noTargetLabeling: true,
};
