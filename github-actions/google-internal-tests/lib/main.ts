import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit, RestEndpointMethodTypes} from '@octokit/rest';
import {getGoogleSyncConfig} from '../../../ng-dev/utils/config.js';
import path from 'path';
import fetch from 'node-fetch';

const syncBranch = 'main';
const statusContext = 'google-internal-tests';

type GetCombinedStatusForRefResponse =
  RestEndpointMethodTypes['repos']['getCombinedStatusForRef']['response'];
type GithubStatus = GetCombinedStatusForRefResponse['data']['statuses'][0];

async function main() {
  if (context.repo.owner !== 'angular') {
    core.info('Skipping Google Internal Tests action for non-Angular repos.');
    return;
  }
  if (context.eventName !== 'pull_request_target') {
    throw new Error(
      'Expected Google Internal Tests action to be triggered for ' +
        '`pull_request_target` events.',
    );
  }

  const githubToken = core.getInput('github-token', {required: true});
  const runTestGuideURL = core.getInput('run-tests-guide-url', {required: false});
  const syncConfigPath = path.resolve(core.getInput('sync-config', {required: true}));
  const syncConfig = await getGoogleSyncConfig(syncConfigPath);

  const prNum = context.payload.pull_request!.number;
  const prHeadSHA = context.payload.pull_request!.head!.sha;
  const prBaseRef = context.payload.pull_request!.base!.ref;
  // TODO: remove once GHA supports node18 as a target runner for Javascript action
  const github = new Octokit({auth: githubToken, request: {fetch}});
  const existingGoogleStatus = await findExistingTestStatus(github, prHeadSHA);

  // If there is an existing status already pointing to an internal CL, we do not override
  // the status. This can happen when e.g. a presubmit-tested PR is closed and reopened.
  if (existingGoogleStatus && existingGoogleStatus.target_url?.startsWith('http://cl/')) {
    core.info(`Pull request HEAD commit already has existing test status.`);
    return;
  }

  if (syncBranch !== prBaseRef) {
    core.info(`Skipping Google Internal Tests action for PRs not targeting: ${syncBranch}`);
    await github.repos.createCommitStatus({
      ...context.repo,
      state: 'success',
      description: `Skipped. PR does not target \`${syncBranch}\` branch`,
      context: statusContext,
      sha: prHeadSHA,
    });
    return;
  }

  core.info(`Checking pull request for files being synced into Google.`);

  const files = await github.paginate(github.pulls.listFiles, {
    ...context.repo,
    pull_number: prNum,
  });

  let affectsGoogle = false;
  for (const f of files) {
    if (syncConfig.ngMatchFn(f.filename) || syncConfig.primitivesMatchFn(f.filename)) {
      affectsGoogle = true;
      break;
    }
  }

  const waitingForG3Status = {
    state: 'pending' as const,
    // The initial waiting status is expected to be overridden by the
    // internal presubmit status service then.
    description: `Waiting for tests to start. ${
      runTestGuideURL ? `@Googlers: Initiate a presubmit. See -->` : ''
    }`.trim(),
    target_url: runTestGuideURL,
  };
  const irrelevantToG3Status = {
    state: 'success' as const,
    description: 'Does not affect Google.',
  };

  await github.repos.createCommitStatus({
    ...context.repo,
    ...(affectsGoogle ? waitingForG3Status : irrelevantToG3Status),
    context: statusContext,
    sha: prHeadSHA,
  });
}

async function findExistingTestStatus(
  github: Octokit,
  prHeadSHA: string,
): Promise<GithubStatus | null> {
  const existingStatuses: GithubStatus[] = await github.paginate(
    github.repos.getCombinedStatusForRef,
    {
      ...context.repo,
      ref: prHeadSHA,
    },
    (r: GetCombinedStatusForRefResponse) => r.data.statuses,
  );

  return existingStatuses.find((s) => s.context === statusContext) ?? null;
}

main().catch((e: Error) => {
  console.error(e);
  core.setFailed(e.message);
});
