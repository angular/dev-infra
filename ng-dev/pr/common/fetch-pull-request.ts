/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Minimatch} from 'minimatch';
import {
  CheckConclusionState,
  CheckStatusState,
  MergeableState,
  PullRequestState,
  StatusState,
  CommentAuthorAssociation,
} from '@octokit/graphql-schema';
import {getPendingPrs, getPr, getPrFiles} from '../../utils/github.js';
import {alias, types as graphqlTypes, onUnion, optional, params} from 'typed-graphqlify';

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {GoogleSyncConfig} from '../../utils/config.js';
import {requiresLabels} from './labels/index.js';

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
  // Along with the `commits` queried below, we always query the oldest commit in the PR and
  // determine its parent SHA. This is the base SHA of a pull request. Note that this is different
  // to the `baseRefOid` which is based on when the PR has been created and the attached base branch.
  [alias('baseCommitInfo', 'commits')]: params(
    {first: 1},
    {nodes: [{commit: {parents: params({first: 1}, {nodes: [{oid: graphqlTypes.string}]})}}]},
  ),
  // Only the last 100 commits from a pull request are obtained as we likely will never see a pull
  // requests with more than 100 commits.
  commits: params(
    {last: 100},
    {
      totalCount: graphqlTypes.number,
      nodes: [
        {
          commit: {
            oid: graphqlTypes.string,
            authoredDate: graphqlTypes.string,
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
  reviewRequests: {
    totalCount: graphqlTypes.number,
  },
  reviews: params(
    {last: 100, states: 'APPROVED'},
    {
      nodes: [
        {
          authorAssociation: graphqlTypes.custom<CommentAuthorAssociation>(),
          bodyText: graphqlTypes.string,
          commit: {
            oid: graphqlTypes.string,
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

export const PR_FILES_SCHEMA = {
  nodes: [
    {
      path: graphqlTypes.string,
    },
  ],
};

export type PullRequestFilesFromGithub = typeof PR_FILES_SCHEMA;

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

/** Fetches a pull request from Github. Returns null if an error occurred. */
export async function fetchPullRequestFilesFromGithub(
  git: AuthenticatedGitClient,
  prNumber: number,
): Promise<PullRequestFilesFromGithub[] | null> {
  return await getPrFiles(PR_FILES_SCHEMA, prNumber, git);
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

/**
 * Gets the list of file paths included in a pull request.
 */
export function pullRequestHasPrimitivesFiles(
  pullRequestFiles: string[],
  config: GoogleSyncConfig,
): boolean {
  const primitivesFilePatterns = config.primitivesFilePatterns.map((p) => new Minimatch(p));
  for (let path of pullRequestFiles) {
    if (primitivesFilePatterns.some((p) => p.match(path))) {
      return true;
    }
  }
  return false;
}

/**
 * Checks for `TESTED=[reason]` review comment on a current commit sha from a google organization member
 */
export function pullRequestHasValidTestedComment(pullRequest: PullRequestFromGithub): boolean {
  pullRequest.commits.nodes.sort((a,b) => ((a.commit.authoredDate <= b.commit.authoredDate) ? 1 : -1));
  const sha = pullRequest.commits.nodes[0].commit.oid;
  // TODO: add check for Google organization membership
  const comments = pullRequest.reviews.nodes.filter(
    (c) =>
      c.authorAssociation === 'MEMBER' &&
      c.bodyText.startsWith('TESTED=') &&
      c.commit.oid === sha,
  );
  return comments.length > 0;
}

/**
 * Checks the list of labels for the `requires: TGP` label
 */
export function pullRequestRequiresTGP(pullRequest: PullRequestFromGithub): boolean {
  const labels = pullRequest.labels.nodes.map((f) => f.name);
  return labels.includes(requiresLabels.REQUIRES_TGP.name);
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
