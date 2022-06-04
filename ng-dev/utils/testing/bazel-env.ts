/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, mkdirSync, rmSync} from 'fs';
import {join} from 'path';

/**
 * Temporary directory which will be used as project directory in tests. Note that this environment
 * variable is automatically set by Bazel for tests. Bazel expects tests "not attempt to remove,
 * chmod, or otherwise alter [TEST_TMPDIR]," so a subdirectory path is used to be created/destroyed.
 */
export const testTmpDir: string = join(process.env['TEST_TMPDIR']!, 'dev-infra');

/**
 * Prepares the temporary test directory, deleting previous contents if present.
 * Ensures the temp directory exists.
 */
export function cleanTestTmpDir() {
  if (existsSync(testTmpDir)) {
    rmSync(testTmpDir, {recursive: true});
  }
  mkdirSync(testTmpDir);
}
