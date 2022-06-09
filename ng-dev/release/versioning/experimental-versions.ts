/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

/** Gets whether the given version denotes an experimental SemVer version. */
export function isExperimentalSemver(version: semver.SemVer): boolean {
  return version.major === 0 && version.minor >= 100;
}

/** Creates the equivalent experimental version for a provided SemVer. */
export function createExperimentalSemver(version: string | semver.SemVer): semver.SemVer {
  version = new semver.SemVer(version);
  const experimentalVersion = new semver.SemVer(version.format());
  experimentalVersion.major = 0;
  experimentalVersion.minor = version.major * 100 + version.minor;
  return new semver.SemVer(experimentalVersion.format());
}
