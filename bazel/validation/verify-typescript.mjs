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

async function main([packageJsonPath, moduleBazelPath]) {
  /** The contents of the MODULE.bazel file. */
  const moduleBazel = await readFile(join(runfiles, moduleBazelPath), 'utf8');
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

  /** The version of typescript extracted from the MODULE.bazel file. */
  const match = moduleBazel.match(/^[^\n#]*\bts_version\b\s*=\s*["']([^"']+)["']/m);
  const moduleBazelVersion = match ? match[1] : undefined;
  if (moduleBazelVersion === undefined) {
    console.error('Unable to find the typescript version within the MODULE.bazel file.');
  }

  // If either version is undefined, the comparison is invalid and we should exit.
  if (packageJsonVersion === undefined || moduleBazelVersion === undefined) {
    process.exitCode = 1;
    return;
  }

  // If the versions don't match, exit as a failure.
  if (packageJsonVersion !== moduleBazelVersion) {
    console.error(
      `Typescript version mismatch between MODULE.bazel (${moduleBazelVersion}) and package.json (${packageJsonVersion})`,
    );
    process.exitCode = 1;
    return;
  }

  console.info(
    `Typescript version matches between MODULE.bazel and package.json: ${moduleBazelVersion}`,
  );
}

main(process.argv.slice(2)).catch((e) => {
  console.error(e);
  process.exit(2);
});
