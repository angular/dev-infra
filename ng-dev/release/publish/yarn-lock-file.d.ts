/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1033
// TODO: Remove when the type resolution is fixed.
declare module '@yarnpkg/lockfile' {
  export * from 'yarnpkg__lockfile';
}
