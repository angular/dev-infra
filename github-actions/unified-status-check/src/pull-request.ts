import {types as graphqlTypes, params, optional, onUnion, query} from 'typed-graphqlify';
import * as core from '@actions/core';
import {CheckConclusionState, PullRequestState, StatusState} from '@octokit/graphql-schema';

import {Octokit} from '@octokit/rest';
import {context} from '@actions/github';

/** All of the statuses to be ignored by the unified status check. */
const ignoredStatuses = core.getMultilineInput('ignored', {trimWhitespace: true});

/** The normalized state of a status or check */
export type NormalizedState = 'success' | 'failure' | 'pending';

/** A normalized status object created from either a CheckRun or StatusContext. */
type NormalizedStatus = {
  state: NormalizedState;
  name: string;
  description?: string;
};

/** The pull request retrieved from Github. */
type PullRequestFromGithub = typeof PR_SCHEMA.repository.pullRequest;

/**  A CheckRun or StatusContext object. */
type CheckOrStatus = NonNullable<
  PullRequestFromGithub['commits']['nodes'][number]['commit']['statusCheckRollup']
>['contexts']['nodes'][number];

/** A pull request retrieved from Github. */
export class PullRequest {
  /** The name of used for the check. */
  private static checkName = 'Unified Status';
  /** All of the ignored statues and checks for pull requests */
  private static ignored = [PullRequest.checkName, ...ignoredStatuses];
  /** The sha of the pull request. */
  sha = this.pullRequest.commits.nodes[0].commit.oid;
  /** Whether the pull request is still in draft. */
  isDraft = this.pullRequest.isDraft;
  /** The current state of the pull request. */
  state = this.pullRequest.state;
  /** The list of current labels applied to the pull request. */
  labels = this.pullRequest.labels.nodes.map(({name}) => name);
  /** The statuses for the pull request. */
  statuses = {
    /** All statuses currently in a pending state. */
    pending: [] as NormalizedStatus[],
    /** All statuses currently in a success state. */
    success: [] as NormalizedStatus[],
    /** All statuses currently in a failing state. */
    failure: [] as NormalizedStatus[],
    /** All  non-ignored statuses on the pull request. */
    all: [] as NormalizedStatus[],
    /** All the statuses which have been ignored. */
    ignored: [] as NormalizedStatus[],
  };
  /** The id of the previous checkRun to be updated, if it exists. */
  previousRunId: number | undefined;

  /** Retrieve the pull request from Github. */
  static async get(github: Octokit) {
    const pullRequest = await github.graphql<typeof PR_SCHEMA>(query(PR_SCHEMA).toString());
    return new PullRequest(github, pullRequest.repository.pullRequest);
  }

  private constructor(private github: Octokit, private pullRequest: PullRequestFromGithub) {
    /** The list of all checks and statuses on the pull request, if any exist. */
    const checksAndStatuses = pullRequest.commits.nodes[0].commit.statusCheckRollup?.contexts.nodes;
    if (checksAndStatuses) {
      this.normalizeAndPopulateStatuses(checksAndStatuses);
    }
  }

  /** Normalize the statuses and checks for usage on the pull request, and then populate the statuses values. */
  private normalizeAndPopulateStatuses(checksAndStatuses: CheckOrStatus[] = []) {
    checksAndStatuses.forEach((checkOrStatus: CheckOrStatus) => {
      /** The normalized status. */
      let status: NormalizedStatus;

      if (checkOrStatus.__typename === 'CheckRun') {
        status = {
          state: checkOrStatus.conclusion
            ? checkConclusionStateToStatusStateMap.get(checkOrStatus.conclusion)!
            : 'pending',
          description: checkOrStatus.title || undefined,
          name: checkOrStatus.name || 'unknown-check-run',
        };

        // If the check is the previous result for the unified check, store the previous run id.
        if (checkOrStatus.name === PullRequest.checkName) {
          this.previousRunId = checkOrStatus.databaseId;
        }
      } else if (checkOrStatus.__typename === 'StatusContext') {
        status = {
          state: checkConclusionStateToStatusStateMap.get(checkOrStatus.state)!,
          name: checkOrStatus.context,
          description: checkOrStatus.description || undefined,
        };
      } else {
        // If the result provided is not a StatusContext or CheckRun, no action should be taken as
        // we only track statuses and checks.
        return;
      }

      // If a status is ignored, track it as ignored but not anywhere else.
      if (PullRequest.ignored.some((matcher) => status.name.match(matcher))) {
        this.statuses.ignored.push(status);
        return;
      }

      switch (status.state) {
        case 'failure':
          this.statuses.failure.push(status);
          break;
        case 'success':
          this.statuses.success.push(status);
          break;
        case 'pending':
          this.statuses.pending.push(status);
          break;
      }

      this.statuses.all.push(status);
    });
  }

  /** Set the check run result for the pull request. */
  async setCheckResult({
    state,
    title,
    summary,
  }: {
    state: NormalizedState;
    title: string;
    summary: string;
  }) {
    /** The parameters for the check run update or creation. */
    const parameters = {
      ...context.repo,
      name: PullRequest.checkName,
      head_sha: this.sha,
      status: state === 'pending' ? 'in_progress' : 'completed',
      conclusion: state === 'pending' ? undefined : state,
      output: {
        title,
        summary,
      },
    };

    if (this.previousRunId) {
      await this.github.checks.update({check_run_id: this.previousRunId, ...parameters});
    } else {
      await this.github.checks.create(parameters);
    }
  }
}

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
    {owner: `"${context.repo.owner}"`, name: `"${context.repo.repo}"`},
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
                                databaseId: graphqlTypes.number,
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
