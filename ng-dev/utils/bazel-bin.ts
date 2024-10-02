/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {determineRepoBaseDirFromCwd} from './repo-directory.js';

let BAZEL_BIN: undefined | string = undefined;

export function getBazelBin() {
  if (BAZEL_BIN === undefined) {
    BAZEL_BIN = process.env.BAZEL || join(determineRepoBaseDirFromCwd(), 'node_modules/.bin/bazel');
  }

  return BAZEL_BIN;
}
