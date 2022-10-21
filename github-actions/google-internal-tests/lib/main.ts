import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit, RestEndpointMethodTypes} from '@octokit/rest';
import {readConfigFile} from '../../../ng-dev/caretaker/g3-sync-config.js';
import path from 'path';

const syncBranch = 'main';
const statusContext = 'google-internal-tests';

type GithubStatus =
  RestEndpointMethodTypes['repos']['getCombinedStatusForRef']['response']['data']['statuses'][0];

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
  const syncConfig = await readConfigFile(syncConfigPath);

  const prNum = context.payload.pull_request!.number;
  const prHeadSHA = context.payload.pull_request!.head!.sha;
  const prBaseRef = context.payload.pull_request!.base!.ref;

  if (syncBranch !== prBaseRef) {
    core.info(`Skipping Google Internal Tests action for PRs not targeting: ${syncBranch}`);
    return;
  }

  const github = new Octokit({auth: githubToken});
  const existingGoogleStatus = await findExistingTestStatus(github, prHeadSHA);

  // If there is an existing status already pointing to an internal CL, we do not override
  // the status. This can happen when e.g. a presubmit-tested PR is closed and reopened.
  if (existingGoogleStatus && existingGoogleStatus.target_url?.startsWith('http://cl/')) {
    return;
  }

  const files = await github.paginate(github.pulls.listFiles, {
    ...context.repo,
    pull_number: prNum,
  });

  let affectsGoogle = false;
  for (const f of files) {
    if (syncConfig.matchFn(f.filename)) {
      affectsGoogle = true;
      break;
    }
  }

  const waitingForG3Status = {
    state: 'pending' as const,
    // The initial waiting status is expected to be overridden by the
    // internal presubmit status service then.
    description: `Waiting for Google Internal Tests. ${
      runTestGuideURL ? `@Googlers: See Details for instructions -->` : ''
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
  const existingStatuses = await github.paginate(
    github.repos.getCombinedStatusForRef,
    {
      ...context.repo,
      ref: prHeadSHA,
    },
    (r) => r.data.statuses as GithubStatus[],
  );

  return existingStatuses.find((s) => s.context === statusContext) ?? null;
}

main().catch((e: Error) => {
  console.error(e);
  core.setFailed(e.message);
});
