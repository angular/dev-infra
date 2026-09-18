/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Extracts metadata information from a given unpacked artifact. An artifact
 * is expected to contain metadata such as the pull request it was built for.
 *
 * The artifact is produced by the unprivileged build workflow, so everything read
 * here is attacker controlled. Each value is therefore format checked, and the
 * claimed pull request is bound to the workflow run that actually triggered this
 * job before any privileged step is allowed to consume it.
 *
 * See: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#using-data-from-the-triggering-workflow.
 */

import {setOutput} from '@actions/core';
import {Octokit} from '@octokit/rest';
import path from 'path';
import fs from 'fs';

import {artifactMetadata} from '../../constants.js';

/** The shape each metadata value is allowed to take. */
const metadataPatterns: Record<keyof typeof artifactMetadata, RegExp> = {
  'pull-number': /^[1-9][0-9]{0,9}$/,
  'build-revision': /^[0-9a-f]{7,40}$/,
};

/** Reads a single metadata value out of the unpacked artifact. */
async function readMetadataValue(
  fullArtifactDirPath: string,
  key: keyof typeof artifactMetadata,
  name: string,
): Promise<string> {
  /** The expected path of the artifact */
  const expectedPath = path.normalize(path.join(fullArtifactDirPath, name));

  // We confirm that the provided artifact path is actually in the expected location instead of pointing somewhere
  // else to exfiltrate information.
  const realPath = await fs.promises.realpath(expectedPath);
  if (expectedPath !== realPath) {
    throw Error(
      `Value for ${key} not stored directly in file as expected,\n  expected: ${expectedPath}\n  got: ${realPath}`,
    );
  }

  const content = (await fs.promises.readFile(expectedPath, 'utf8')).trim();

  // The file contents come from the untrusted build, so reject anything that is not
  // exactly the shape we expect before it reaches a deploy target or a comment.
  if (!metadataPatterns[key].test(content)) {
    throw Error(
      `Value for ${key} does not match the expected format ${metadataPatterns[key]}.\n` +
        `  got: ${JSON.stringify(content.slice(0, 100))}`,
    );
  }

  return content;
}

async function main() {
  const [artifactDirPath] = process.argv.slice(2);
  /** The full path to the artifact directory. */
  const fullArtifactDirPath = await fs.promises.realpath(artifactDirPath);

  const githubToken = process.env['GITHUB_TOKEN'];
  const workflowRunHeadSha = process.env['WORKFLOW_RUN_HEAD_SHA'];
  const repository = process.env['GITHUB_REPOSITORY'];

  if (!githubToken || !workflowRunHeadSha || !repository) {
    throw Error(
      'GITHUB_TOKEN, WORKFLOW_RUN_HEAD_SHA and GITHUB_REPOSITORY must all be set so that the ' +
        'artifact metadata can be verified against the triggering workflow run.',
    );
  }

  const [owner, repo] = repository.split('/');
  const pullNumber = await readMetadataValue(
    fullArtifactDirPath,
    'pull-number',
    artifactMetadata['pull-number'],
  );

  // `build-revision` is read so that a malformed artifact still fails loudly, but the value
  // published below is the one taken from the trusted `workflow_run` payload.
  await readMetadataValue(
    fullArtifactDirPath,
    'build-revision',
    artifactMetadata['build-revision'],
  );

  /**
   * Bind the claimed pull request to the workflow run that triggered this job. Without this
   * an artifact may name any pull request, which would let an untrusted build choose the
   * deploy channel and the pull request that gets commented on.
   */
  const github = new Octokit({auth: githubToken});
  const {data: pullRequest} = await github.pulls.get({
    owner,
    repo,
    pull_number: Number(pullNumber),
  });

  if (pullRequest.head.sha !== workflowRunHeadSha) {
    throw Error(
      `Refusing to continue: the artifact claims pull request #${pullNumber}, but that pull ` +
        `request's head commit is ${pullRequest.head.sha} while this workflow run was ` +
        `triggered by ${workflowRunHeadSha}.`,
    );
  }

  console.info(`Verified pull request #${pullNumber} against workflow run ${workflowRunHeadSha}`);

  setOutput('pull-number', pullNumber);
  setOutput('build-revision', workflowRunHeadSha);
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
