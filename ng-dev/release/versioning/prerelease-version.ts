/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

/**
 * Gets whether the given version is the first `-next` pre-release.
 * e.g. returns `true` for `v14.0.0-next.0`, but not for `v14.0.0-next.1`.
 */
export function isFirstNextPrerelease(v: semver.SemVer): boolean {
  return v.prerelease[0] === 'next' && v.prerelease[1] === 0;
}
