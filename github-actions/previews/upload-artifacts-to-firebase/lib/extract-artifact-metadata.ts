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

export interface WorkflowRunPullRequest {
  number: number;
  [key: string]: unknown;
}

export interface WorkflowRunPayload {
  head_sha?: string;
  pull_requests?: WorkflowRunPullRequest[];
  [key: string]: unknown;
}

export interface ValidatedMetadata {
  'pull-number': string;
  'build-revision': string;
}

/**
 * Validates untrusted metadata extracted from an uploaded artifact against the
 * trusted workflow_run event payload.
 *
 * Fails closed if the workflow_run event is missing, has no pull requests attached,
 * or if the metadata does not match the triggering PR or commit SHA.
 */
export function validateArtifactMetadata(
  rawMetadata: Record<string, string>,
  workflowRun: WorkflowRunPayload | undefined,
): ValidatedMetadata {
  if (!workflowRun) {
    throw new Error(
      'Missing context.payload.workflow_run. Preview deployment metadata can only be verified in workflow_run events.',
    );
  }

  // Previews and sticky comments exist exclusively for pull requests. Fail closed if pull_requests is missing or empty.
  if (!Array.isArray(workflowRun.pull_requests) || workflowRun.pull_requests.length === 0) {
    throw new Error(
      'No pull requests associated with workflow_run event. Preview deployment cannot proceed without verified PR context.',
    );
  }

  const rawPullNumber = rawMetadata['pull-number'];
  if (!rawPullNumber || typeof rawPullNumber !== 'string') {
    throw new Error('Missing or empty "pull-number" in artifact metadata.');
  }

  const trimmedPullNumber = rawPullNumber.trim();
  if (!/^\d+$/.test(trimmedPullNumber)) {
    throw new Error(
      `Invalid pull-number format in artifact metadata: "${rawPullNumber}". Expected a positive integer.`,
    );
  }

  const parsedPullNumber = Number.parseInt(trimmedPullNumber, 10);
  if (parsedPullNumber <= 0) {
    throw new Error(
      `Invalid pull-number in artifact metadata: "${rawPullNumber}". Expected a positive non-zero integer.`,
    );
  }

  const validPrNumbers = workflowRun.pull_requests.map((pr) => pr.number);
  if (!validPrNumbers.includes(parsedPullNumber)) {
    throw new Error(
      `Untrusted pull-number ${parsedPullNumber} does not match any pull request associated with the workflow_run event (valid PRs: ${validPrNumbers.join(', ')}).`,
    );
  }

  // Validate build revision against workflow_run.head_sha
  if (
    !workflowRun.head_sha ||
    typeof workflowRun.head_sha !== 'string' ||
    !/^[0-9a-f]{40}$/i.test(workflowRun.head_sha.trim())
  ) {
    throw new Error(
      `Missing or malformed head_sha in workflow_run payload: "${workflowRun.head_sha}". Expected 40-character hex commit SHA.`,
    );
  }

  const rawRevision = rawMetadata['build-revision'];
  if (!rawRevision || typeof rawRevision !== 'string') {
    throw new Error('Missing or empty "build-revision" in artifact metadata.');
  }

  const trimmedRevision = rawRevision.trim();
  if (!/^[0-9a-f]{7,40}$/i.test(trimmedRevision)) {
    throw new Error(
      `Invalid build-revision format in artifact metadata: "${rawRevision}". Expected 7-40 hex characters.`,
    );
  }

  const canonicalHeadSha = workflowRun.head_sha.trim().toLowerCase();
  if (!canonicalHeadSha.startsWith(trimmedRevision.toLowerCase())) {
    throw new Error(
      `Untrusted build-revision "${trimmedRevision}" does not match workflow_run head_sha "${workflowRun.head_sha}".`,
    );
  }

  return {
    'pull-number': `${parsedPullNumber}`,
    'build-revision': canonicalHeadSha,
  };
}

function getWorkflowRunPayload(): WorkflowRunPayload | undefined {
  const eventPath = process.env['GITHUB_EVENT_PATH'];
  if (eventPath && fs.existsSync(eventPath)) {
    try {
      const payload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
      return payload?.workflow_run;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

async function resolveWorkflowRunPayload(
  rawMetadata: Record<string, string>,
): Promise<WorkflowRunPayload | undefined> {
  const workflowRun = getWorkflowRunPayload();

  const githubToken = process.env['GITHUB_TOKEN'];
  const workflowRunHeadSha = process.env['WORKFLOW_RUN_HEAD_SHA'] ?? workflowRun?.head_sha;
  const repository = process.env['GITHUB_REPOSITORY'];
  const rawPullNumber = rawMetadata['pull-number']?.trim();

  if (
    (!workflowRun?.pull_requests || workflowRun.pull_requests.length === 0) &&
    githubToken &&
    workflowRunHeadSha &&
    repository &&
    rawPullNumber &&
    /^[1-9][0-9]{0,9}$/.test(rawPullNumber)
  ) {
    const [owner, repo] = repository.split('/');
    const github = new Octokit({auth: githubToken});
    const response = await github.pulls.get({
      owner,
      repo,
      pull_number: Number(rawPullNumber),
    });
    if (response.data.head.sha.toLowerCase() === workflowRunHeadSha.toLowerCase()) {
      return {
        ...workflowRun,
        head_sha: workflowRunHeadSha,
        pull_requests: [{number: response.data.number}],
      };
    }
    return {
      ...workflowRun,
      head_sha: workflowRunHeadSha,
      pull_requests: [],
    };
  }

  return workflowRun;
}

/**
 * Extracts and validates metadata files from the unpacked artifact directory.
 */
export async function extractAndValidateArtifactMetadata(
  artifactDirPath: string,
  workflowRun?: WorkflowRunPayload,
  setOutputFn: typeof setOutput = setOutput,
): Promise<ValidatedMetadata> {
  const fullArtifactDirPath = await fs.promises.realpath(artifactDirPath);
  const rawMetadata: Record<string, string> = {};

  for (const [key, name] of Object.entries(artifactMetadata)) {
    const expectedPath = path.normalize(path.join(fullArtifactDirPath, name));

    // Confirm that the provided artifact path is actually in the expected location instead of pointing somewhere
    // else to exfiltrate information.
    const realPath = await fs.promises.realpath(expectedPath);
    if (expectedPath !== realPath) {
      throw Error(
        `Value for unsafe-${key} not stored directly in file as expected,\n  expected: ${expectedPath}\n  got: ${realPath}`,
      );
    }

    const content = await fs.promises.readFile(expectedPath, 'utf8');
    rawMetadata[key] = content;
  }

  const resolvedWorkflowRun =
    workflowRun !== undefined ? workflowRun : await resolveWorkflowRunPayload(rawMetadata);
  const validated = validateArtifactMetadata(rawMetadata, resolvedWorkflowRun);

  for (const [key, value] of Object.entries(validated)) {
    const outputName = `unsafe-${key}`;
    console.info(`Setting output: ${outputName} = ${value}`);
    setOutputFn(outputName, value);
  }

  return validated;
}

async function main() {
  const [artifactDirPath] = process.argv.slice(2);
  if (!artifactDirPath) {
    throw new Error('Missing required argument: artifactDirPath');
  }

  await extractAndValidateArtifactMetadata(artifactDirPath);
}

if (
  process.env['JASMINE_RUNNER'] === undefined &&
  !process.env['TEST_TARGET'] &&
  !process.env['TEST_SRCDIR']
) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
