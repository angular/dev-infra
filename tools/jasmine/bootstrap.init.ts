/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {setCachedConfig} from '../../ng-dev/utils/config-cache.js';
import {cleanTestTmpDir} from '../../ng-dev/utils/testing/bazel-env.js';

beforeEach(() => {
  // Before each spec runs, clean the temporary test dir to prevent specs from effecting each other.
  cleanTestTmpDir();
  // Reset the cached ng-dev configuration between specs.
  setCachedConfig({});
});
