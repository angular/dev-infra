/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {cleanTestTmpDir} from '../../ng-dev/utils/testing/bazel-env';

/**
 *  The `boot` utility function from `@bazel/jasmine` allows initialization before the runner, with
 *  protections to prevent calling `boot` again.
 */
const {boot} = require('@bazel/jasmine');

// Initialize jasmine, because beforeEach and other jasmine "globals" are not defined in the
// environment until jasmine has been initialized.  Since our bootstrap explicitly is meant to use
// these globals, we need to ensure that jasmine has already initialized before the major content
// of our script executes.  We only call this if jasmine has not already been initialized.
if (global.jasmine === undefined) {
  boot();
}

beforeEach(() => {
  // Before each spec runs, clean the temporary test dir to prevent specs from effecting each other.
  cleanTestTmpDir();
});
