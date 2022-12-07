import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';
import {StatusState} from '@octokit/graphql-schema';
import {getPullRequest, unifiedStatusCheckName} from './pull-request.js';
import {isDraft} from './draft-mode.js';
import {checkOnlyPassingStatuses, checkRequiredStatuses} from './statuses.js';

async function main() {
  /** A Github API instance. */
  const github = new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT)});

  try {
    /** The pull request triggering the event */
    const pullRequest = await getPullRequest(github);
    const unifiedCheckStatus = pullRequest.statuses.unifiedCheckStatus;

    const setStatus = async (
      state: Omit<StatusState, 'ERROR' | 'EXPECTED'>,
      description?: string,
    ) => {
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
        state: state.toLowerCase() as 'pending' | 'success' | 'failure',
        description,
      });
      return;
    };

    /** If no status checks are present, or if the pull request is in a draft state the unified status is in a pending state. */
    const isDraftValidationResult = isDraft(pullRequest);
    if (isDraftValidationResult.state === 'PENDING') {
      await setStatus(isDraftValidationResult.state, isDraftValidationResult.description);
      return;
    }

    const hasRequiredStatusesResult = checkRequiredStatuses(pullRequest);
    if (hasRequiredStatusesResult.state === 'PENDING') {
      await setStatus(hasRequiredStatusesResult.state, hasRequiredStatusesResult.description);
      return;
    }

    const hasPassingStatusesResult = checkOnlyPassingStatuses(pullRequest);
    if (hasPassingStatusesResult.state === 'PENDING') {
      await setStatus(hasPassingStatusesResult.state, hasPassingStatusesResult.description);
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
