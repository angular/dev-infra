import {PullRequestConfig} from '../ng-dev/pr/config';

/** Configuration for interacting with pull requests in the repo. */
export const pullRequest: PullRequestConfig = {
  githubApiMerge: false,
  mergeReadyLabel: 'action: merge',
  caretakerNoteLabel: 'merge note',
  commitMessageFixupLabel: 'needs commit fixup',
  noTargetLabeling: true,
};
