import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';
import {CheckConclusionState, StatusState} from '@octokit/graphql-schema';
import {getPullRequest} from './pull-request.js';
import {isDraft} from './draft-mode.js';

const unifiedStatusCheckName = 'Unified Status';

async function main() {
  /** A Github API instance. */
  const github = new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT)});

  try {
    /** Status matchers to ignore within the context of the action, always ignoring the actions own status. */
    const ignored = [
      unifiedStatusCheckName,
      ...core.getMultilineInput('ignored', {trimWhitespace: true}),
    ];
    /** Status matchers which must match at least one of the current statuses . */
    const required = core.getMultilineInput('required', {trimWhitespace: true});
    /** The pull request triggering the event */
    const pullRequest = await getPullRequest(github);
    /** The status check rollup results. */
    const statusChecks = pullRequest.commits.nodes[0].commit.statusCheckRollup;

    /** If no status checks are present yet, we ignore the event. */
    if (!statusChecks) {
      return;
    }

    const allStatuses: {state: StatusState; name: string; description: string | undefined}[] =
      statusChecks.contexts.nodes.map((checkOrStatus) => {
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
      });
    const statuses = allStatuses.filter(({name}) => !ignored.includes(name));
    const unifiedCheckStatus = allStatuses.find(({name}) => name === unifiedStatusCheckName);

    const setStatus = async (state: StatusState, description?: string) => {
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
        sha: pullRequest.commits.nodes[0].commit.oid,
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

    const missedStatuses = required.filter(
      (matcher) => !statuses.some(({name}) => name.match(matcher)),
    );
    if (missedStatuses.length > 0) {
      await setStatus(
        'PENDING',
        `Pending ${missedStatuses.length} status(es): ${missedStatuses.join(', ')}`,
      );
      return;
    }

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
      await setStatus('FAILURE', `${counts.failing} expected status(es) failing`);
      return;
    }

    if (counts.pending > 0) {
      await setStatus('PENDING', 'Other tracked statuses are still pending');
      return;
    }

    await setStatus('SUCCESS');
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

main().catch((err) => {
  console.error(err);
  core.setFailed('Failed with the above error');
});
