/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import assert from 'node:assert';

/** The runfiles directory for the script. */
const runfiles = process.env['JS_BINARY__RUNFILES'];
assert(runfiles, 'Expected `JS_BINARY__RUNFILES` to be set.');

async function main([prettierIgnorePath, bundlePath]) {
  const prettierIgnoreContent = await readFile(join(runfiles, prettierIgnorePath), 'utf8');
  const ignoredFiles = new Set(
    prettierIgnoreContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#')),
  );

  // The bundlePath is relative to the runfiles, e.g., "devinfra/.github/local-actions/update-models/main.js"
  // We need to clean it up to match the relative workspace path.
  // Aspect JS rules prefix the path with the workspace name segment (e.g. "_main" or "devinfra").
  // Removing the first segment gets the workspace-relative path.
  const relativePath = bundlePath.replace(/^[^/]+\//, '');

  if (!ignoredFiles.has(relativePath)) {
    console.error(
      `Error: The checked-in bundle "${relativePath}" is not ignored in .prettierignore.`,
    );
    console.error(
      `Please add "${relativePath}" to .prettierignore to prevent formatting check-in mismatches.`,
    );
    process.exitCode = 1;
  } else {
    console.info(`Validation passed: "${relativePath}" is correctly ignored in .prettierignore.`);
  }
}

main(process.argv.slice(2)).catch((e) => {
  console.error(e);
  process.exit(2);
});
