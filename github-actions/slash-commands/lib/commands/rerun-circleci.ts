import * as core from '@actions/core';
import {Octokit} from '@octokit/rest';
import {context} from '@actions/github';
import {getAuthTokenFor, ANGULAR_ROBOT} from '../../../utils';
import fetch from 'node-fetch';
import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';

export async function rerunCircleCi() {
  const circleToken = core.getInput('circleci-token');
  const token = await getAuthTokenFor(ANGULAR_ROBOT);
  // Create authenticated Github client.
  const github = new Octokit({auth: token});
  /** The pull request for the action currently running. */
  const {data: pullRequest} = await github.pulls.get({
    ...context.repo,
    pull_number: context.payload.issue!.number,
  });

  try {
    const workflowId = await getCircleCiWorkflowIdForPullRequest(pullRequest, github, circleToken);
    const rerunUrl = `https://circleci.com/api/v2/workflow/${workflowId}/rerun`;
    // Attempt to restart the rerun.
    const response = await (
      await fetch(rerunUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Circle-Token': circleToken,
        },
        body: JSON.stringify({from_failed: true}),
      })
    ).json();

    assertNoErrorsInCircleCiResponse(response);
  } catch (err) {
    // If the rerun attempt failed comment on the issue informing the requestor.
    await github.issues.createComment({
      ...context.repo,
      issue_number: pullRequest.number,
      body:
        `@${context.actor} the CircleCI rerun you requested failed.  See details below:\n\n` +
        `\`\`\`\n${err.message}\n\`\`\``,
      number: pullRequest.number,
    });

    core.error(err);
  }
}

// TODO(josephperrott): Find multiple workflows on a pr.
/** Retrieve the workflow ID of the latest CircleCI run for the provided pull request. */
async function getCircleCiWorkflowIdForPullRequest(
  pullRequest: RestEndpointMethodTypes['pulls']['get']['response']['data'],
  github: Octokit,
  circleCiToken: string,
) {
  const {owner, repo} = context.repo;
  /** The list of statuses for the latest ref of the PR. */
  const {statuses} = (
    await github.repos.getCombinedStatusForRef({
      owner,
      repo,
      ref: pullRequest.head.ref,
    })
  ).data;
  /** The target url of the discovered CircleCI status. */
  let targetUrl = statuses.find((status) => status.context.startsWith('ci/circleci:'))?.target_url;

  if (targetUrl === undefined) {
    throw Error('No status for a CircleCI workflow was found on the pull request to be rerun.');
  }

  /** Results of the regex to select the job ID of the job which the status represents. */
  const jobIdMatcher = targetUrl.match(`https://circleci.com/gh/${owner}/${repo}/(\d+)\?`);

  if (jobIdMatcher === null) {
    throw Error('Unable to determine the job ID for the CircleCI job creating the status');
  }

  /** The job ID. */
  const job = jobIdMatcher[0];
  /** The full url of the API request to CircleCI. */
  const url = `https://circleci.com/api/v2/project/gh/${owner}/${repo}/job/${job}`;
  /** The API response from the CircleCI request. */
  const response = await (
    await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Circle-Token': circleCiToken,
      },
    })
  ).json();

  assertNoErrorsInCircleCiResponse(response);

  return response.latest_workflow.id;
}

/**
 * Checks the provided response from CircleCI's API to determine if it is an error message.
 *
 * Properly handled failures in the CircleCI requests are returned with an HTTP response code of 200
 * and json response with a `:message` key mapping to the failure message.  If `:message` is not
 * defined, the API request was successful.
 */
function assertNoErrorsInCircleCiResponse(response: any) {
  if (response[':message'] !== undefined) {
    throw Error(response[':message']);
  }
}
