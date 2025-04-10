/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'node:fs';
import {trueCasePath} from 'true-case-path';

/** Gets whether the file is executable or not. */
export async function isExecutable(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets a case-exact system realpath for the specified path.
 *
 * This is useful for example because Bazel passes `C:\users\<..>` as action input, but
 * the actual case-exact path for the current platform would be: `C:\Users\<..>`.
 */
export async function getCaseExactRealpath(filePath: string): Promise<string> {
  // Note: Need to use `realpath` first in case the path is abbreviated on Windows via tilde.
  return trueCasePath(fs.realpathSync.native(filePath));
}

/** Adds the `write` permission to the given file using `chmod`. */
export async function addWritePermissionFlag(filePath: string) {
  if (await isExecutable(filePath)) {
    await fs.promises.chmod(filePath, 0o755);
  } else {
    await fs.promises.chmod(filePath, 0o644);
  }
}

/** Writes an executable file to the specified location. */
export async function writeExecutableFile(outputFilePath: string, content: string): Promise<void> {
  await fs.promises.writeFile(outputFilePath, content, {mode: 0o755});
}
