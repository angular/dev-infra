import * as core from '@actions/core';
import {Octokit} from '@octokit/rest';
import {components as OctokitTypes} from '@octokit/openapi-types';
import {context} from '@actions/github';
import fetch, {HeadersInit, RequestInit} from 'node-fetch';

/** CircleCI JSON response on errors. See: https://circleci.com/docs/api/v2. */
interface CircleErrorResponse {
  message?: string;
}

export async function rerunCircleCi(installationGithub: Octokit) {
  /** Authenticated CircleCi client */
  const circleci = new CircleCiClient();
  /** The pull request for the action currently running. */
  const {data: pullRequest} = await installationGithub.pulls.get({
    ...context.repo,
    pull_number: context.payload.issue!.number,
  });

  try {
    const workflowId = await getCircleCiWorkflowIdForPullRequest(
      pullRequest,
      installationGithub,
      circleci,
    );
    await circleci.post(`workflow/${workflowId}/rerun`, {from_failed: true});
  } catch (err) {
    if (err instanceof Error) {
      // If the rerun attempt failed comment on the issue informing the requestor.
      await installationGithub.issues.createComment({
        ...context.repo,
        issue_number: pullRequest.number,
        body:
          `@${context.actor} the CircleCI rerun you requested failed.  See details below:\n\n` +
          `\`\`\`\n${err.message}\n\`\`\``,
        number: pullRequest.number,
      });
      core.error(err);
    }
    throw err;
  }
}

// TODO(josephperrott): Find multiple workflows on a pr.
/** Retrieve the workflow ID of the latest CircleCI run for the provided pull request. */
async function getCircleCiWorkflowIdForPullRequest(
  pullRequest: OctokitTypes['schemas']['pull-request'],
  github: Octokit,
  circleci: CircleCiClient,
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
  /**
   * The target url of the discovered CircleCI status, reversed to search the latest statuses first.
   */
  let targetUrl = statuses
    .reverse()
    .find((status) => status.context.startsWith('ci/circleci:'))?.target_url;

  if (targetUrl === undefined || targetUrl === null) {
    throw Error('No status for a CircleCI workflow was found on the pull request to be rerun.');
  }

  /** Results of the regex to select the job ID of the job which the status represents. */
  const jobIdMatcher = targetUrl.match(`https://circleci.com/gh/${owner}/${repo}/(\\d+)`);

  if (jobIdMatcher === null) {
    throw Error('Unable to determine the job ID for the CircleCI job creating the status');
  }

  /** The job ID. */
  const job = jobIdMatcher[1];
  /** The API response from the CircleCI request. */
  const result = await circleci.get(`project/gh/${owner}/${repo}/job/${job}`);

  return result.latest_workflow.id;
}

class CircleCiClient {
  /** Headers to include in all HTTP requests. */
  private headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Circle-Token': core.getInput('circleci-token', {required: true}),
  };

  /** Perform a GET request against the CircleCI api. */
  async get<T = any>(path: string): Promise<T> {
    return this.request<T>(path, 'GET');
  }

  /** Perform a POST request against the CircleCI api. */
  async post<T = any>(path: string, body: Object): Promise<T> {
    return this.request<T>(path, 'POST', body);
  }

  /** Perform a request against the CircleCI api. */
  private async request<T>(path: string, method: 'GET' | 'POST', body: Object = {}): Promise<T> {
    const url = `https://circleci.com/api/v2/${path}`;

    const requestInit: RequestInit = {
      method,
      headers: this.headers,
    };

    if (method !== 'GET') {
      requestInit['body'] = JSON.stringify(body);
    }

    const response = await fetch(url, requestInit);
    const responseJson = (await response.json()) as T | CircleErrorResponse;

    if (!response.ok) {
      const message = (responseJson as CircleErrorResponse)['message'] || 'Unknown error';
      throw Error(`Error code: ${response.status}  Message: ${message}`);
    }

    return responseJson as T;
  }
}
