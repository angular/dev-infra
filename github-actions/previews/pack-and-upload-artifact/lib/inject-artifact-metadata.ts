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

async function main() {
  const [deployDirPath, prNumber, buildRevision] = process.argv.slice(2);

  await fs.promises.writeFile(path.join(deployDirPath, artifactMetadata['pull-number']), prNumber);
  await fs.promises.writeFile(
    path.join(deployDirPath, artifactMetadata['build-revision']),
    buildRevision,
  );
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
