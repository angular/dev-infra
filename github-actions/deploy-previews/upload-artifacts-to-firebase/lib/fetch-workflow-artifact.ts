/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Fetches a specified artifact by name from the given workflow and writes
 * the downloaded zip file to the stdout.
 *
 * Command line usage:
 *   <SCRIPT> <workflow-id> <artifact-name>
 */

import {Octokit} from '@octokit/rest';

async function main() {
  const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/', 2);
  const [workflowIdRaw, artifactName] = process.argv.slice(2);
  const workflowId = Number(workflowIdRaw);
  const github = new Octokit({auth: process.env.GITHUB_TOKEN});
  const artifacts = await github.actions.listWorkflowRunArtifacts({
    owner,
    repo,
    run_id: workflowId,
  });

  const matchArtifact = artifacts.data.artifacts.find((artifact) => artifact.name === artifactName);

  if (matchArtifact === undefined) {
    console.error(`Could not find artifact in workflow: ${workflowId}@${artifactName}`);
    process.exit(1);
  }

  const download = await github.actions.downloadArtifact({
    owner,
    repo,
    artifact_id: matchArtifact.id,
    archive_format: 'zip',
  });

  process.stdout.write(Buffer.from(download.data as Buffer));
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
