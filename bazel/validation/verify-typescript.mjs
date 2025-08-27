/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

/** The runfiles directory for the script. */
const runfiles = process.env['RUNFILES'];

async function main([packageJsonPath, moduleLockFilePath]) {
  /** The json contents of the BAZEL.module.lock file. */
  const moduleLock = JSON.parse(await readFile(join(runfiles, moduleLockFilePath), 'utf8'));
  /** The json contents of the package.json file. */
  const packageJson = JSON.parse(await readFile(join(runfiles, packageJsonPath), 'utf8'));
  /** The version of typescript extracted from the package.json file. */
  let packageJsonVersion;
  try {
    packageJsonVersion =
      packageJson['dependencies']?.['typescript'] || packageJson['devDependencies']?.['typescript'];
  } catch {
    console.error('Unable to find the typescript version within the package.json file.');
  }

  /** The version of typescript extracted from the BAZEL.module.lock file. */
  let lockfileVersion;
  try {
    // The path to the generated repo specs is static based on the location of the extension
    // used. The name of the generated repo is determined by the user so we instead need to take
    // the first value/item from the `generaredRepoSpecs` property and get the version from the
    // attributes there.
    const generatedRepoSpecs =
      moduleLock['moduleExtensions']?.['@@aspect_rules_ts~//ts:extensions.bzl%ext']?.['general']?.[
        'generatedRepoSpecs'
      ];
    lockfileVersion =
      Object.values(generatedRepoSpecs || {})[0]?.['attributes']?.['version'] || 'unknown';
  } catch {
    console.error('Unable to find the typescript version within the MODULE.bazel.lock file.');
  }

  // If either version is undefined, the comparison is invalid and we should exit.
  if (packageJsonVersion === undefined || lockfileVersion === undefined) {
    process.exitCode = 1;
    return;
  }

  // If the versions don't match, exit as a failure.
  if (packageJsonVersion !== lockfileVersion) {
    console.error(
      `Typescript version mismatch between MODULE.bazel (${lockfileVersion}) and package.json (${packageJsonVersion})`,
    );
    process.exitCode = 1;
    return;
  }

  console.info(
    `Typescript version matches between MODULE.bazel and package.json: ${lockfileVersion}`,
  );
}

main(process.argv.slice(2)).catch((e) => {
  console.error(e);
  process.exit(2);
});
