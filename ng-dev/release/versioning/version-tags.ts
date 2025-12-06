/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

/** Gets the release tag name for the specified version. */
export function getReleaseTagForVersion(version: semver.SemVer): string {
  return `v${version.format()}`;
}
