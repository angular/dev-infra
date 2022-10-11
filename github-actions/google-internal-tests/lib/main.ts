import core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import minimatch from 'minimatch';

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
  const rawPatterns = core.getInput('affected-file-patterns', {required: true});
  const runTestGuideURL = core.getInput('run-tests-guide-url', {required: false});
  const patterns = constructPatterns(rawPatterns);

  const github = new Octokit({auth: githubToken});
  const prNum = context.payload.pull_request!.number;
  const prHeadSHA = context.payload.pull_request!.head!.sha;

  const files = await github.paginate(github.pulls.listFiles, {
    ...context.repo,
    pull_number: prNum,
  });

  let affectsGoogle = false;
  for (const f of files) {
    if (patterns.some((p) => p.match(f.filename))) {
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
    sha: prHeadSHA,
  });
}

function constructPatterns(rawPatterns: string): minimatch.IMinimatch[] {
  const patterns: minimatch.IMinimatch[] = [];
  for (let p of rawPatterns.split(/\r?\n/g)) {
    p = p.trim();
    if (p !== '') {
      patterns.push(new minimatch.Minimatch(p));
    }
  }
  return patterns;
}

main().catch((e: Error) => {
  core.error(e);
  core.setFailed(e.message);
});
