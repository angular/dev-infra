import * as core from '@actions/core';
import {context} from '@actions/github';
import {types as graphqlTypes, params, optional, onUnion, query} from 'typed-graphqlify';
import {Octokit} from '@octokit/rest';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';
import {CheckConclusionState, PullRequestState, StatusState} from '@octokit/graphql-schema';

const unifiedStatusCheckName = 'Unified Status';

async function main() {
  /** A Github API instance. */
  const github = new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT)});

  try {
    /** Statuses to ignore within the context of the action, always ignoring the actions own status. */
    const ignoredStatuses = [
      unifiedStatusCheckName,
      ...core.getMultilineInput('ignored-statuses', {trimWhitespace: true}),
    ];
    /** The pull request triggering the event */
    const pullRequest = (
      await github.graphql<typeof PR_SCHEMA>(query(PR_SCHEMA).toString(), {
        ...context.issue,
      })
    ).repository.pullRequest;
    /** The status check rollup results. */
    const statusChecks = pullRequest.commits.nodes[0].commit.statusCheckRollup;

    /** If no status checks are present, or if the pull request is in a draft state the unified status is in a pending state. */
    if (!statusChecks || pullRequest.isDraft) {
      await github.repos.createCommitStatus({
        ...context.repo,
        state: 'pending',
        sha: pullRequest.commits.nodes[0].commit.oid,
        context: unifiedStatusCheckName,
        description: 'Unified Status checks have not yet started',
      });
      return;
    }

    const statuses: {state: StatusState; name: string}[] = statusChecks.contexts.nodes
      .map((checkOrStatus) => {
        if (checkOrStatus.__typename === 'StatusContext') {
          return {
            state: checkOrStatus.state,
            name: checkOrStatus.context,
          };
        }
        if (checkOrStatus.__typename === 'CheckRun') {
          return {
            state: checkOrStatus.conclusion
              ? checkConclusionStateToStatusStateMap.get(checkOrStatus.conclusion)!
              : 'PENDING',
            name: checkOrStatus.name || 'Unknown Check Run',
          };
        }
        throw Error();
      })
      .filter(({name}) => !ignoredStatuses.includes(name));

    const counts = statuses.reduce(
      (count, {state}) => {
        if (isPassingState(state)) {
          count.passing += 1;
        }
        if (isPendingState(state)) {
          count.pending += 1;
        }
        if (isFailingState(state)) {
          count.failing += 1;
        }
        return count;
      },
      {passing: 0, failing: 0, pending: 0},
    );

    if (counts.failing > 0) {
      await github.repos.createCommitStatus({
        ...context.repo,
        sha: pullRequest.commits.nodes[0].commit.oid,
        context: unifiedStatusCheckName,
        state: 'failure',
        description: `${counts.failing} expected status(es) failing`,
      });
      return;
    }

    if (counts.pending > 0) {
      await github.repos.createCommitStatus({
        ...context.repo,
        state: 'pending',
        sha: pullRequest.commits.nodes[0].commit.oid,
        context: unifiedStatusCheckName,
        description: 'Expected statuses are still pending',
      });
      return;
    }

    await github.repos.createCommitStatus({
      ...context.repo,
      sha: pullRequest.commits.nodes[0].commit.oid,
      context: unifiedStatusCheckName,
      state: 'success',
    });
  } finally {
    await revokeActiveInstallationToken(github);
  }
}

/** Whether a status state is a passing state. */
function isPassingState(state: StatusState) {
  return state === 'SUCCESS' || state === 'EXPECTED';
}

/** Whether a status state is a pending state. */
function isPendingState(state: StatusState) {
  return state === 'PENDING';
}

/** Whether a status state is a failing state. */
function isFailingState(state: StatusState) {
  return state === 'ERROR' || state === 'FAILURE';
}

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
const PR_SCHEMA = params(
  {
    $number: 'Int!', // The PR number
    $owner: 'String!', // The name of the owner
    $repo: 'String!', // The name of the repository
  },
  {
    repository: params(
      {owner: '$owner', name: '$repo'},
      {
        pullRequest: params(
          {number: '$number'},
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
                    },
                  },
                ],
              },
            ),
          },
        ),
      },
    ),
  },
);

main().catch((err) => {
  console.error(err);
  core.setFailed('Failed with the above error');
});
