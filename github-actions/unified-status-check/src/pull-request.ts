import {types as graphqlTypes, params, optional, onUnion, query} from 'typed-graphqlify';
import * as core from '@actions/core';
import {CheckConclusionState, PullRequestState, StatusState} from '@octokit/graphql-schema';

import {Octokit} from '@octokit/rest';
import {context} from '@actions/github';

export const unifiedStatusCheckName = 'Unified Status';

type NormalizedStatus = {state: StatusState; name: string; description?: string};

class Statuses {
  pending: NormalizedStatus[] = [];
  failing: NormalizedStatus[] = [];
  passing: NormalizedStatus[] = [];
  ignored: NormalizedStatus[] = [];
  all: NormalizedStatus[] = [];
  unifiedCheckStatus: NormalizedStatus | undefined;

  populate(statuses: NormalizedStatus[]) {
    const ignored = [
      unifiedStatusCheckName,
      ...core.getMultilineInput('ignored', {trimWhitespace: true}),
    ];

    for (const status of statuses) {
      if (ignored.includes(status.name)) {
        this.ignored.push(status);
        if (status.name === unifiedStatusCheckName) {
          this.unifiedCheckStatus = status;
        }
        continue;
      }
      switch (status.state) {
        case 'ERROR':
        case 'FAILURE':
          this.failing.push(status);
        case 'EXPECTED':
        case 'SUCCESS':
          this.passing.push(status);
        case 'PENDING':
          this.pending.push(status);
        default:
          this.all.push(status);
      }
    }
  }
}

/** A pull request retrieved from Github. */
export type PullRequest = {
  sha: string;
  isDraft: boolean;
  state: PullRequestState;
  labels: string[];
  statuses: Statuses;
};

/** Mapping of Github Check Conclusion states to Status states. */
const checkConclusionStateToStatusStateMap = new Map<CheckConclusionState, StatusState>([
  ['ACTION_REQUIRED', 'PENDING'],
  ['CANCELLED', 'ERROR'],
  ['FAILURE', 'FAILURE'],
  ['NEUTRAL', 'EXPECTED'],
  ['SKIPPED', 'EXPECTED'],
  ['STALE', 'ERROR'],
  ['STARTUP_FAILURE', 'FAILURE'],
  ['SUCCESS', 'SUCCESS'],
  ['TIMED_OUT', 'FAILURE'],
]);

/** GraphQL schema for requesting the status information for a given pull request. */
const PR_SCHEMA = {
  repository: params(
    {owner: context.repo.owner, name: context.repo.repo},
    {
      pullRequest: params(
        {number: context.issue.number},
        {
          isDraft: graphqlTypes.boolean,
          state: graphqlTypes.custom<PullRequestState>(),
          number: graphqlTypes.number,
          commits: params(
            {last: 1},
            {
              nodes: [
                {
                  commit: {
                    oid: graphqlTypes.string,
                    statusCheckRollup: optional({
                      contexts: params(
                        {last: 100},
                        {
                          nodes: [
                            onUnion({
                              CheckRun: {
                                __typename: graphqlTypes.constant('CheckRun'),
                                conclusion: graphqlTypes.custom<CheckConclusionState | null>(),
                                name: graphqlTypes.string,
                                title: optional(graphqlTypes.string),
                              },
                              StatusContext: {
                                __typename: graphqlTypes.constant('StatusContext'),
                                state: graphqlTypes.custom<StatusState>(),
                                context: graphqlTypes.string,
                                description: optional(graphqlTypes.string),
                              },
                            }),
                          ],
                        },
                      ),
                    }),
                  },
                },
              ],
            },
          ),
        },
      ),
    },
  ),
};

/** Get the pull request for the status check */
export async function getPullRequest(github: Octokit) {
  return github.graphql<typeof PR_SCHEMA>(query(PR_SCHEMA).toString()).then(parseGithubPullRequest);
}

function parseGithubPullRequest({repository: {pullRequest}}: typeof PR_SCHEMA): PullRequest {
  let statuses = new Statuses();

  const statusCheckRollup = pullRequest.commits.nodes[0].commit.statusCheckRollup;
  if (statusCheckRollup) {
    statuses.populate(
      statusCheckRollup.contexts.nodes.map((checkOrStatus) => {
        if (checkOrStatus.__typename === 'StatusContext') {
          return {
            state: checkOrStatus.state,
            name: checkOrStatus.context,
            description: checkOrStatus.description || undefined,
          };
        }
        if (checkOrStatus.__typename === 'CheckRun') {
          return {
            state: checkOrStatus.conclusion
              ? checkConclusionStateToStatusStateMap.get(checkOrStatus.conclusion)!
              : 'PENDING',
            description: checkOrStatus.title || undefined,
            name: checkOrStatus.name || 'unknown-check-run',
          };
        }
        throw Error('CheckOrStatus was not found to be a check or a status');
      }),
    );
  }

  return {
    sha: pullRequest.commits.nodes[0].commit.oid,
    isDraft: pullRequest.isDraft,
    labels: [],
    state: pullRequest.state,
    statuses,
  };
}
