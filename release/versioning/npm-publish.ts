/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';
import {spawnWithDebugOutput} from '../../utils/child-process';

/**
 * Sets the NPM tag to the specified version for the given package.
 * @throws With the process log output if the tagging failed.
 */
export async function setNpmTagForPackage(
    packageName: string, distTag: string, version: semver.SemVer, registryUrl: string|undefined) {
  const args = ['dist-tag', 'add', `${packageName}@${version}`, distTag];
  // If a custom registry URL has been specified, add the `--registry` flag.
  if (registryUrl !== undefined) {
    args.push('--registry', registryUrl);
  }
  await spawnWithDebugOutput('npm', args, {mode: 'silent'});
}
