/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {spawnSync} from 'child_process';

/** Determines the repository base directory from the current working directory. */
export function determineRepoBaseDirFromCwd() {
  // TODO(devversion): Replace with common spawn sync utility once available.
  const {stdout, stderr, status} = spawnSync('git', ['rev-parse --show-toplevel'], {
    shell: true,
    stdio: 'pipe',
    encoding: 'utf8',
  });
  if (status !== 0) {
    throw Error(
      `Unable to find the path to the base directory of the repository.\n` +
        `Was the command run from inside of the repo?\n\n` +
        `${stderr}`,
    );
  }
  return stdout.trim();
}
