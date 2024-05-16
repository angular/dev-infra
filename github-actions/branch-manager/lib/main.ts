import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {actionLabels, targetLabels} from '../../../ng-dev/pr/common/labels/index.js';
import {revokeActiveInstallationToken, getAuthTokenFor, ANGULAR_ROBOT} from '../../utils.js';
import {
  PullRequestLabeledEvent,
  PullRequestEvent,
  PushEvent,
} from '@octokit/webhooks-definitions/schema.js';

/** Set of target label names. */
const targetLabelNames = new Set(Object.values(targetLabels).map((t) => t.name));

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

    const mergeReadyPrQuery =
      `repo:${context.repo.owner}/${context.repo.repo} ` +
      `is:pr ` +
      `is:open ` +
      `label:"${actionLabels.ACTION_MERGE.name}"`;

    const prs = await github().then((api) =>
      api.paginate(
        api.search.issuesAndPullRequests,
        {
          q: mergeReadyPrQuery,
        },
        (issues) => issues.data.map((i) => `${i.number}`),
      ),
    );
    core.info(`Triggering ${prs.length} prs to be evaluated`);

    // Invoke sequentially to avoid github secondary rate limits
    // https://docs.github.com/en/rest/guides/best-practices-for-integrators?apiVersion=2022-11-28#dealing-with-secondary-rate-limits
    for (const pr of prs) {
      await createWorkflowForPullRequest({
        repo: context.issue.repo,
        owner: context.issue.owner,
        pr,
      });
    }
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
        await createWorkflowForPullRequest({
          repo: context.issue.repo,
          owner: context.issue.owner,
          pr: `${context.issue.number}`,
          sha: payload.pull_request.head.sha,
        });
      }
    }

    if (context.payload.action === 'labeled') {
      const payload = context.payload as PullRequestLabeledEvent;
      // If the merge label has been added, or if target labels have changed another update of
      // the merge status is needed.
      if (
        payload.label.name === actionLabels.ACTION_MERGE.name ||
        targetLabelNames.has(payload.label.name)
      ) {
        await createWorkflowForPullRequest({
          repo: context.issue.repo,
          owner: context.issue.owner,
          pr: `${context.issue.number}`,
          sha: payload.pull_request.head.sha,
        });
      }
    }
  }
}

type WorkflowInputs = {
  repo: string;
  owner: string;
  pr: string;
  sha?: string;
};

/** Create a workflow dispatch event to trigger the pr to be evaluated for mergeability. */
async function createWorkflowForPullRequest(inputs: WorkflowInputs) {
  /** An instance of the octokit Github client. */
  const githubClient = await github();

  // When a sha is provided we set the status on sha to note that mergeability check is about to start.
  if (inputs.sha !== undefined) {
    await githubClient.repos.createCommitStatus({
      repo: inputs.repo,
      owner: inputs.owner,
      state: 'pending',
      description: 'Running mergibility check',
      sha: inputs.sha,
      context: 'mergeability',
    });
  }

  console.info(`Requesting workflow run for: ${JSON.stringify(inputs)}`);
  await githubClient.actions.createWorkflowDispatch({
    owner: 'angular',
    repo: 'dev-infra',
    ref: 'main',
    workflow_id: 'branch-manager.yml',
    inputs,
  });
}

/** The Octokit instance, if defined to allow token revocation after the action executes. */
let _github: Octokit | null = null;
/** Get the shared instance of Octokit, first creating the instance if necessary. */
async function github() {
  if (_github === null) {
    const token = await getAuthTokenFor(ANGULAR_ROBOT);
    _github = new Octokit({auth: token});
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
