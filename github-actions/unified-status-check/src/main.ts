import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';
import {getPullRequest, NormalizedState, unifiedStatusCheckName} from './pull-request.js';
import {isDraft} from './draft-mode.js';
import {checkOnlyPassingStatuses, checkRequiredStatuses} from './statuses.js';

async function main() {
  /** A Github API instance. */
  const github = new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT)});

  try {
    /** The pull request triggering the event */
    const pullRequest = await getPullRequest(github);
    const unifiedCheckStatus = pullRequest.statuses.unifiedCheckStatus;

    const setStatus = async (state: NormalizedState, description?: string) => {
      if (
        unifiedCheckStatus &&
        unifiedCheckStatus.state === state &&
        unifiedCheckStatus.description === description
      ) {
        console.log(
          'Skipping status update as the request status and information is the same as the current status',
        );
        return;
      }

      await github.repos.createCommitStatus({
        ...context.repo,
        sha: pullRequest.sha,
        context: unifiedStatusCheckName,
        state,
        description,
      });
      return;
    };

    /** If no status checks are present, or if the pull request is in a draft state the unified status is in a pending state. */
    const isDraftValidationResult = isDraft(pullRequest);
    if (isDraftValidationResult.state === 'pending') {
      await setStatus(isDraftValidationResult.state, isDraftValidationResult.description);
      return;
    }

    const requiredStatusesResult = checkRequiredStatuses(pullRequest);
    if (requiredStatusesResult.state === 'pending') {
      await setStatus(requiredStatusesResult.state, requiredStatusesResult.description);
      return;
    }

    const onlyPassingStatusesResult = checkOnlyPassingStatuses(pullRequest);
    if (onlyPassingStatusesResult.state === 'pending') {
      await setStatus(onlyPassingStatusesResult.state, onlyPassingStatusesResult.description);
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
