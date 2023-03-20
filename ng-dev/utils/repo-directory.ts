/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChildProcess} from './child-process.js';

/** Determines the repository base directory from the current working directory. */
export function determineRepoBaseDirFromCwd() {
  const {stdout, stderr, status} = ChildProcess.spawnSync('git', ['rev-parse --show-toplevel']);
  if (status !== 0) {
    throw Error(
      `Unable to find the path to the base directory of the repository.\n` +
        `Was the command run from inside of the repo?\n\n` +
        `${stderr}`,
    );
  }
  return stdout.trim();
}
