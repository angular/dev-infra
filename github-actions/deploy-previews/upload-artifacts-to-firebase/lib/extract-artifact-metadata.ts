/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Extracts metadata information from a given unpacked artifact. An artifact
 * is expected to contain metadata such as the pull request it was built for.
 *
 * See: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#using-data-from-the-triggering-workflow.
 */

import {setOutput} from '@actions/core';
import path from 'path';
import fs from 'fs';

import {artifactMetadata} from '../../constants.js';

async function main() {
  const [artifactDirPath] = process.argv.slice(2);

  for (const [key, name] of Object.entries(artifactMetadata)) {
    const content = await fs.promises.readFile(path.join(artifactDirPath, name), 'utf8');
    const outputName = `unsafe-${key}`;

    console.info(`Setting output: ${outputName} = ${content}`);
    setOutput(outputName, content.trim());
  }
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
