import {actionLabels, targetLabels} from '../../../../ng-dev/pr/common/labels/index.js';
import {PullRequest} from '../pull-request.js';
import {ValidationFunction} from '../validator.js';

export const checkForTargelLabel: ValidationFunction = (pullRequest: PullRequest) => {
  const appliedLabel = Object.values(targetLabels).find((label) =>
    pullRequest.labels.includes(label.name),
  );
  if (appliedLabel !== undefined) {
    return {
      state: 'success',
      description: `Pull request has target label: "${appliedLabel.name}"`,
    };
  }
  return {
    state: 'pending',
    description: 'Waiting for target label on the pull request',
  };
};

export const isMergeReady: ValidationFunction = (pullRequest: PullRequest) => {
  if (!pullRequest.labels.includes(actionLabels.ACTION_MERGE.name)) {
    return {
      state: 'pending',
      description: `Waiting for "${actionLabels.ACTION_MERGE.name}" label`,
    };
  }

  if (pullRequest.labels.includes(actionLabels.ACTION_REVIEW.name)) {
    return {
      state: 'failure',
      description: `Marked for merge but still has the "${actionLabels.ACTION_REVIEW.name}" label`,
    };
  }

  if (pullRequest.labels.includes(actionLabels.ACTION_CLEANUP.name)) {
    return {
      state: 'failure',
      description: `Marked for merge but still has the "${actionLabels.ACTION_CLEANUP.name}" label`,
    };
  }

  return {
    state: 'success',
    description: `Marked for merge by the "${actionLabels.ACTION_MERGE.name}" label`,
  };
};
