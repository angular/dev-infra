/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SemVer} from 'semver';

/** Gets the release tag name for the specified version. */
export function getReleaseTagForVersion(version: SemVer): string {
  return version.format();
}
