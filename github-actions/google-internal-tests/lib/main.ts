import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit, RestEndpointMethodTypes} from '@octokit/rest';
import minimatch from 'minimatch';

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
  const syncedFilesRaw = core.getInput('synced-files', {required: true});
  const alwaysExternalFilesRaw = core.getInput('always-external-files', {required: false});

  const prNum = context.payload.pull_request!.number;
  const prHeadSHA = context.payload.pull_request!.head!.sha;
  const prBaseRef = context.payload.pull_request!.base!.ref;

  if (syncBranch !== prBaseRef) {
    core.info(`Skipping Google Internal Tests action for PRs not targeting: ${syncBranch}`);
    return;
  }

  const syncedFiles = constructPatterns(syncedFilesRaw);
  const alwaysExternalFiles = constructPatterns(alwaysExternalFilesRaw);

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
    // Perf: Skip matching the external file patterns if the file is not even synced.
    const isSynced = syncedFiles.some((p) => p.match(f.filename));
    const isExcluded = !isSynced || alwaysExternalFiles.some((p) => p.match(f.filename));

    if (isSynced && !isExcluded) {
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

function constructPatterns(rawPatterns: string): minimatch.IMinimatch[] {
  const patterns: minimatch.IMinimatch[] = [];
  for (let p of rawPatterns.split(/\r?\n/g)) {
    p = p.trim();
    // Support comments, lines starting with a hashtag.
    if (p.startsWith('#')) {
      continue;
    } else if (p !== '') {
      patterns.push(new minimatch.Minimatch(p));
    }
  }
  return patterns;
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
  core.error(e);
  core.setFailed(e.message);
});
