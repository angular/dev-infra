/**
 * Configuration for the merge tool in `ng-dev`. This sets up the labels which
 * are respected by the merge script (e.g. the target labels).
 *
 * @type { import("../ng-dev/index.js").PullRequestConfig }
 */
export const pullRequest = {
  githubApiMerge: {
    default: 'auto',
    labels: [{pattern: 'merge: squash commits', method: 'squash'}],
  },
  requiredStatuses: [{name: 'test', type: 'check'}],

  // Disable target labeling in the dev-infra repo as we don't have
  // any release trains and version branches.
  __noTargetLabeling: true,
};
