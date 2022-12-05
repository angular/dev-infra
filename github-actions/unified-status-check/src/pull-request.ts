import {types as graphqlTypes, params, optional, onUnion, query} from 'typed-graphqlify';
import * as core from '@actions/core';
import {CheckConclusionState, PullRequestState, StatusState} from '@octokit/graphql-schema';

import {Octokit} from '@octokit/rest';
import {context} from '@actions/github';

const ignoredStatuses = core.getMultilineInput('ignored', {trimWhitespace: true});

export const unifiedStatusCheckName = 'Unified Status';

export type NormalizedState = 'success' | 'failure' | 'pending';

type NormalizedStatus = {state: NormalizedState; name: string; description?: string};

class Statuses {
  pending: NormalizedStatus[] = [];
  failing: NormalizedStatus[] = [];
  passing: NormalizedStatus[] = [];
  ignored: NormalizedStatus[] = [];
  all: NormalizedStatus[] = [];
  unifiedCheckStatus: NormalizedStatus | undefined;

  populate(statuses: NormalizedStatus[]) {
    const ignored = [unifiedStatusCheckName, ...ignoredStatuses];

    for (const status of statuses) {
      if (ignored.some((matcher) => status.name.match(matcher))) {
        this.ignored.push(status);
        if (status.name === unifiedStatusCheckName) {
          this.unifiedCheckStatus = status;
        }
        continue;
      }
      switch (status.state) {
        case 'failure':
          this.failing.push(status);
          break;
        case 'success':
          this.passing.push(status);
          break;
        case 'pending':
          this.pending.push(status);
          break;
      }

      this.all.push(status);
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
const checkConclusionStateToStatusStateMap = new Map<
  CheckConclusionState | StatusState,
  NormalizedState
>([
  ['ACTION_REQUIRED', 'pending'],
  ['CANCELLED', 'failure'],
  ['ERROR', 'failure'],
  ['EXPECTED', 'success'],
  ['FAILURE', 'failure'],
  ['NEUTRAL', 'success'],
  ['PENDING', 'pending'],
  ['SKIPPED', 'success'],
  ['STALE', 'failure'],
  ['STARTUP_FAILURE', 'failure'],
  ['SUCCESS', 'success'],
  ['TIMED_OUT', 'failure'],
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
          labels: params(
            {last: 100},
            {
              nodes: [
                {
                  name: graphqlTypes.string,
                },
              ],
            },
          ),
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
            state: checkConclusionStateToStatusStateMap.get(checkOrStatus.state)!,
            name: checkOrStatus.context,
            description: checkOrStatus.description || undefined,
          };
        }
        if (checkOrStatus.__typename === 'CheckRun') {
          return {
            state: checkOrStatus.conclusion
              ? checkConclusionStateToStatusStateMap.get(checkOrStatus.conclusion)!
              : 'pending',
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
    labels: pullRequest.labels.nodes.map(({name}) => name),
    state: pullRequest.state,
    statuses,
  };
}
