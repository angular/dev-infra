import {types as graphqlTypes, params, optional, onUnion, query} from 'typed-graphqlify';
import * as core from '@actions/core';
import {CheckConclusionState, PullRequestState, StatusState} from '@octokit/graphql-schema';

import {Octokit, RestEndpointMethodTypes} from '@octokit/rest';
import {context} from '@actions/github';

/** All of the statuses to be ignored by the unified status check. */
const ignoredStatuses = core.getMultilineInput('ignored', {trimWhitespace: true});

/** All of the trusted creators for status checks. */
const trustedCreators = ['angular-robot', 'ngbot', 'pullapprove'];

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
  private static checkName = 'Merge Ready Tracking';
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

  /** Whether the pull request is from a fork. */
  isForkPR() {
    const headRepo = this.pullRequest.headRepository;
    if (!headRepo) {
      return false;
    }
    return headRepo.owner.login !== context.repo.owner || headRepo.name !== context.repo.repo;
  }

  /** Get the owner of the fork repository. */
  getForkOwner() {
    return this.pullRequest.headRepository?.owner.login;
  }

  /** Retrieve the pull request from Github. */
  static async get(github: Octokit) {
    const pullRequest = await github.graphql<typeof PR_SCHEMA>(query(PR_SCHEMA).toString());
    return new PullRequest(github, pullRequest.repository.pullRequest);
  }

  private constructor(
    private github: Octokit,
    private pullRequest: PullRequestFromGithub,
  ) {
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
        const checkRunRepo = checkOrStatus.checkSuite?.repository;
        if (checkRunRepo) {
          const isUpstream =
            checkRunRepo.owner.login === context.repo.owner &&
            checkRunRepo.name === context.repo.repo;
          if (!isUpstream) {
            core.warning(
              `Ignoring CheckRun "${checkOrStatus.name}" because it originated from fork repository "${checkRunRepo.owner.login}/${checkRunRepo.name}".`,
            );
            return;
          }
        }

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
        const creatorLogin = checkOrStatus.creator?.login;
        const isTrusted =
          creatorLogin &&
          trustedCreators.some((tc) => creatorLogin === tc || creatorLogin === `${tc}[bot]`);
        if (!isTrusted) {
          const isIgnored = PullRequest.ignored.some((matcher) =>
            checkOrStatus.context.match(matcher),
          );
          if (!isIgnored) {
            throw new Error(
              `Security Violation: Status "${checkOrStatus.context}" was created by untrusted user "${creatorLogin}".`,
            );
          }
          return;
        }

        if (this.isForkPR()) {
          const forkOwner = this.getForkOwner();
          if (forkOwner && checkOrStatus.targetUrl) {
            if (checkOrStatus.targetUrl.includes(`/${forkOwner}/`)) {
              throw new Error(
                `Security Violation: Status "${checkOrStatus.context}" (created by ${creatorLogin}) points to fork repository of "${forkOwner}".`,
              );
            }
          }
        }

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
    const createParameters: RestEndpointMethodTypes['checks']['create']['parameters'] = {
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
      const updateParameters: RestEndpointMethodTypes['checks']['update']['parameters'] = {
        check_run_id: this.previousRunId,
        ...createParameters,
      };
      await this.github.checks.update(updateParameters);
    } else {
      await this.github.checks.create(createParameters);
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
          headRepository: optional({
            owner: {
              login: graphqlTypes.string,
            },
            name: graphqlTypes.string,
          }),
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
                                checkSuite: {
                                  repository: {
                                    name: graphqlTypes.string,
                                    owner: {
                                      login: graphqlTypes.string,
                                    },
                                  },
                                },
                              },
                              StatusContext: {
                                __typename: graphqlTypes.constant('StatusContext'),
                                state: graphqlTypes.custom<StatusState>(),
                                context: graphqlTypes.string,
                                description: optional(graphqlTypes.string),
                                creator: optional({
                                  login: graphqlTypes.string,
                                }),
                                targetUrl: optional(graphqlTypes.string),
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
