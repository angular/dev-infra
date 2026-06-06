/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Injects metadata information into the given unpacked artifact. An artifact
 * is expected to contain metadata such as the pull request it was built for.
 *
 * The deploy job later will extract this information when it fetches the artifact.
 *
 * See: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#using-data-from-the-triggering-workflow.
 */

import path from 'path';
import fs from 'fs';

import {artifactMetadata} from '../../constants.js';

async function safeWrite(
  deployDirPath: string,
  metadataKey: keyof typeof artifactMetadata,
  content: string,
) {
  const fileName = artifactMetadata[metadataKey];
  const targetPath = path.join(deployDirPath, fileName);

  // Securely remove the file first if it exists to prevent TOCTOU and link-following attacks.
  await fs.promises.rm(targetPath, {force: true});

  await fs.promises.writeFile(targetPath, content);
}

async function main() {
  const [deployDirPath, prNumber, buildRevision] = process.argv.slice(2);

  // Ensure deployDirPath itself is not a symlink
  try {
    const stat = await fs.promises.lstat(deployDirPath);
    if (stat.isSymbolicLink()) {
      throw new Error(`Security violation: deploy directory ${deployDirPath} is a symbolic link.`);
    }
  } catch (e: any) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  await safeWrite(deployDirPath, 'pull-number', prNumber);
  await safeWrite(deployDirPath, 'build-revision', buildRevision);
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
