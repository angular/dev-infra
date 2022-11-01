import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {actionLabels} from '../../../ng-dev/pr/common/labels.js';
import {revokeActiveInstallationToken, getAuthTokenFor, ANGULAR_ROBOT} from '../../utils.js';
import {
  PullRequestLabeledEvent,
  PullRequestEvent,
  PushEvent,
} from '@octokit/webhooks-definitions/schema.js';

async function run() {
  if (context.eventName === 'push') {
    const {ref} = context.payload as PushEvent;
    if (ref.startsWith('refs/tags/')) {
      core.info('No evaluation needed as tags do not cause branches to need to be rechecked');
      return;
    }

    if (ref !== 'refs/heads/main') {
      // TODO: support pushes to all releasable branches rather than just main.
      core.info('Skipping evaluation as the push does not affect the main branch');
      return;
    }

    core.info(`Evaluating pull requests as a result of a push to '${ref}'`);
    const prs = await github().then((api) =>
      api.paginate(
        api.pulls.list,
        {...context.repo, state: 'open', labels: actionLabels.ACTION_MERGE.name},
        (pulls) => pulls.data.map((pull) => `${pull.number}`),
      ),
    );
    core.info(`Triggering ${prs.length} prs to be evaluated`);
    await Promise.all([...prs.map((pr) => createWorkflowForPullRequest({pr}))]);
  }

  if (context.eventName === 'pull_request_target') {
    if (
      ['opened', 'synchronize', 'reopened', 'ready_for_review'].includes(context.payload.action!)
    ) {
      const payload = context.payload as PullRequestEvent;
      const hasMergeLabel = payload.pull_request.labels.some(
        ({name}) => name === actionLabels.ACTION_MERGE.name,
      );
      if (hasMergeLabel) {
        await createWorkflowForPullRequest();
      }
    }

    if (context.payload.action === 'labeled') {
      const event = context.payload as PullRequestLabeledEvent;
      if (event.label.name === actionLabels.ACTION_MERGE.name) {
        await createWorkflowForPullRequest();
      }
    }
  }
}

/** The pull request from the context of the action being run, used as the default pull request. */
const pullRequestFromContext = {
  repo: context.issue.repo,
  owner: context.issue.owner,
  pr: `${context.issue.number}`,
};
type WorkflowInputs = typeof pullRequestFromContext;

/** Create a workflow dispatch event to trigger the pr to be evaluated for mergeability. */
function createWorkflowForPullRequest(prInfo?: Partial<WorkflowInputs>) {
  const inputs = {...pullRequestFromContext, ...prInfo};
  console.info(`Requesting workflow run for: ${JSON.stringify(inputs)}`);
  return github().then((api) =>
    api.actions.createWorkflowDispatch({
      headers: {
        // Github requires the authorization to be `token <token>` for this endpoint instead of the
        // standard `Bearer <token>`.
        'authorization': `token ${token}`,
      },
      owner: 'angular',
      repo: 'dev-infra',
      ref: 'main',
      workflow_id: 'branch-manager.yml',
      inputs,
    }),
  );
}

/** The authorization token for the Github app. */
let token: string;
/** The Octokit instance, if defined to allow token revokation after the action executes. */
let _github: Octokit | null = null;
/** Get the shared instance of Octokit, first creating the instance if necessary. */
async function github() {
  if (_github === null) {
    token = await getAuthTokenFor(ANGULAR_ROBOT);
    _github = new Octokit({token});
  }
  return _github;
}

try {
  await run().catch((e: Error) => {
    console.error(e);
    core.setFailed(e.message);
  });
} finally {
  _github && (await revokeActiveInstallationToken(_github));
}
