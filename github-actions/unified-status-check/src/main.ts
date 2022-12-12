import * as core from '@actions/core';
import {Octokit} from '@octokit/rest';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';
import {PullRequest} from './pull-request.js';
import {isDraft} from './draft-mode.js';
import {checkOnlyPassingStatuses, checkRequiredStatuses} from './statuses.js';
import {checkForTargelLabel, isMergeReady} from './labels.js';

async function main() {
  /** A Github API instance. */
  const github = new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT)});

  try {
    /** The pull request triggering the event */
    const pullRequest = await PullRequest.get(github);

    /** If no status checks are present, or if the pull request is in a draft state the unified status is in a pending state. */
    const isDraftValidationResult = isDraft(pullRequest);
    if (isDraftValidationResult.state === 'pending') {
      await pullRequest.setCheckResult(
        isDraftValidationResult.state,
        isDraftValidationResult.description,
      );
      return;
    }

    const isMergeReadyResult = isMergeReady(pullRequest);
    if (isMergeReadyResult.state === 'pending') {
      await pullRequest.setCheckResult(isMergeReadyResult.state, isMergeReadyResult.description);
      return;
    }

    const requiredStatusesResult = checkRequiredStatuses(pullRequest);
    if (requiredStatusesResult.state === 'pending') {
      await pullRequest.setCheckResult(
        requiredStatusesResult.state,
        requiredStatusesResult.description,
      );
      return;
    }

    const onlyPassingStatusesResult = checkOnlyPassingStatuses(pullRequest);
    if (onlyPassingStatusesResult.state === 'pending') {
      await pullRequest.setCheckResult(
        onlyPassingStatusesResult.state,
        onlyPassingStatusesResult.description,
      );
      return;
    }

    const targetLabelResult = checkForTargelLabel(pullRequest);
    if (targetLabelResult.state === 'pending') {
      await pullRequest.setCheckResult(targetLabelResult.state, targetLabelResult.description);
      return;
    }
  } finally {
    await revokeActiveInstallationToken(github);
  }
}

main().catch((err) => {
  console.error(err);
  core.setFailed('Failed with the above error');
});
