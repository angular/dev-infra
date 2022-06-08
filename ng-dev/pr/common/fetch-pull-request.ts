/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  CheckConclusionState,
  CheckStatusState,
  MergeableState,
  PullRequestState,
  StatusState,
} from '@octokit/graphql-schema';
import {getPendingPrs, getPr} from '../../utils/github.js';
import {types as graphqlTypes, onUnion, optional, params} from 'typed-graphqlify';

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';

/** A status for a pull request status or check. */
export enum PullRequestStatus {
  PASSING,
  FAILING,
  PENDING,
}

/** Graphql schema for the response body the requested pull request. */
export const PR_SCHEMA = {
  url: graphqlTypes.string,
  isDraft: graphqlTypes.boolean,
  state: graphqlTypes.custom<PullRequestState>(),
  number: graphqlTypes.number,
  mergeable: graphqlTypes.custom<MergeableState>(),
  updatedAt: graphqlTypes.string,
  // Only the last 100 commits from a pull request are obtained as we likely will never see a pull
  // requests with more than 100 commits.
  commits: params(
    {last: 100},
    {
      totalCount: graphqlTypes.number,
      nodes: [
        {
          commit: {
            statusCheckRollup: optional({
              state: graphqlTypes.custom<StatusState>(),
              contexts: params(
                {last: 100},
                {
                  nodes: [
                    onUnion({
                      CheckRun: {
                        __typename: graphqlTypes.constant('CheckRun'),
                        status: graphqlTypes.custom<CheckStatusState>(),
                        conclusion: graphqlTypes.custom<CheckConclusionState | null>(),
                        name: graphqlTypes.string,
                      },
                      StatusContext: {
                        __typename: graphqlTypes.constant('StatusContext'),
                        state: graphqlTypes.custom<StatusState>(),
                        context: graphqlTypes.string,
                      },
                    }),
                  ],
                },
              ),
            }),
            message: graphqlTypes.string,
          },
        },
      ],
    },
  ),
  maintainerCanModify: graphqlTypes.boolean,
  viewerDidAuthor: graphqlTypes.boolean,
  headRefOid: graphqlTypes.string,
  headRef: {
    name: graphqlTypes.string,
    repository: {
      url: graphqlTypes.string,
      nameWithOwner: graphqlTypes.string,
    },
  },
  baseRef: {
    name: graphqlTypes.string,
    repository: {
      url: graphqlTypes.string,
      nameWithOwner: graphqlTypes.string,
    },
  },
  baseRefName: graphqlTypes.string,
  title: graphqlTypes.string,
  labels: params(
    {first: 100},
    {
      nodes: [
        {
          name: graphqlTypes.string,
        },
      ],
    },
  ),
};

export type PullRequestFromGithub = typeof PR_SCHEMA;

/** Type describing the normalized and combined status of a pull request. */
export type PullRequestStatusInfo = {
  combinedStatus: PullRequestStatus;
  statuses: {
    status: PullRequestStatus;
    type: 'check' | 'status';
    name: string;
  }[];
};

/** Fetches a pull request from Github. Returns null if an error occurred. */
export async function fetchPullRequestFromGithub(
  git: AuthenticatedGitClient,
  prNumber: number,
): Promise<PullRequestFromGithub | null> {
  return await getPr(PR_SCHEMA, prNumber, git);
}

/** Fetches a pull request from Github. Returns null if an error occurred. */
export async function fetchPendingPullRequestsFromGithub(
  git: AuthenticatedGitClient,
): Promise<PullRequestFromGithub[] | null> {
  return await getPendingPrs(PR_SCHEMA, git);
}

/**
 * Gets the statuses for a commit from a pull request, using a consistent interface
 * for both status and checks results.
 */
export function getStatusesForPullRequest(
  pullRequest: PullRequestFromGithub,
): PullRequestStatusInfo {
  const nodes = pullRequest.commits.nodes;
  /** The combined github status and github checks object. */
  const {statusCheckRollup} = nodes[nodes.length - 1].commit;

  // If there is no status check rollup (i.e. no status nor checks), we
  // consider the pull request status as failing.
  if (!statusCheckRollup) {
    return {
      combinedStatus: PullRequestStatus.FAILING,
      statuses: [],
    };
  }

  const statuses = statusCheckRollup.contexts.nodes.map((context) => {
    switch (context.__typename) {
      case 'CheckRun':
        return {
          type: 'check' as const,
          name: context.name,
          status: normalizeGithubCheckState(context.conclusion, context.status),
        };
      case 'StatusContext':
        return {
          type: 'status' as const,
          name: context.context,
          status: normalizeGithubStatusState(context.state),
        };
    }
  });

  return {
    combinedStatus: normalizeGithubStatusState(statusCheckRollup.state),
    statuses,
  };
}

/** Retrieve the normalized PullRequestStatus for the provided github status state. */
function normalizeGithubStatusState(state: StatusState): PullRequestStatus {
  switch (state) {
    case 'FAILURE':
    case 'ERROR':
      return PullRequestStatus.FAILING;
    case 'PENDING':
      return PullRequestStatus.PENDING;
    case 'SUCCESS':
    case 'EXPECTED':
      return PullRequestStatus.PASSING;
  }
}

/** Retrieve the normalized PullRequestStatus for the provided github check state. */
function normalizeGithubCheckState(
  conclusion: CheckConclusionState | null,
  status: CheckStatusState,
): PullRequestStatus {
  if (status !== 'COMPLETED') {
    return PullRequestStatus.PENDING;
  }

  // If the `status` is completed, a conclusion is guaranteed to be set.
  switch (conclusion!) {
    case 'ACTION_REQUIRED':
    case 'TIMED_OUT':
    case 'CANCELLED':
    case 'FAILURE':
    case 'SKIPPED':
    case 'STALE':
    case 'STARTUP_FAILURE':
      return PullRequestStatus.FAILING;
    case 'SUCCESS':
    case 'NEUTRAL':
      return PullRequestStatus.PASSING;
  }
}
