/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

import {ReleaseConfig} from '../config/index.js';
import {LtsNpmDistTag} from './long-term-support.js';

/**
 * Type describing the possible NPM dist tags used by Angular packages:
 *   - latest: Stable versions. These are releases from the "latest" train.
 *   - next: Next versions. These are releases from the FF/RC or "next" train.
 *   - do-not-use-exceptional-minor: Exceptional minors have their own NPM dist tag since
 *     we would not want to override `latest`, nor would we want to revert `@next` if
 *     the version is already ahead. The tags are expected to be deleted after the minor
 *     becomes stable.
 */
export type NpmDistTag = 'latest' | 'next' | 'do-not-use-exceptional-minor' | LtsNpmDistTag;

/** Type describing an NPM package fetched from the registry. */
export interface NpmPackageInfo {
  /** Maps of versions and their package JSON objects. */
  'versions': {[name: string]: undefined | object};
  /** Map of NPM dist-tags and their chosen version. */
  'dist-tags': {[tagName: string]: string | undefined};
  /** Map of versions and their ISO release time. */
  'time': {[name: string]: string};
}

/**
 * Cache for requested NPM package information. A cache is desirable as the NPM
 * registry requests are usually very large and slow.
 */
export const _npmPackageInfoCache: {[pkgName: string]: Promise<NpmPackageInfo>} = {};

/** Fetches the NPM package representing the project. */
export async function fetchProjectNpmPackageInfo(config: ReleaseConfig): Promise<NpmPackageInfo> {
  return await fetchPackageInfoFromNpmRegistry(config.representativeNpmPackage);
}

/** Gets whether the given version is published to NPM or not */
export async function isVersionPublishedToNpm(
  version: semver.SemVer,
  config: ReleaseConfig,
): Promise<boolean> {
  const {versions} = await fetchProjectNpmPackageInfo(config);
  return versions[version.format()] !== undefined;
}

/** Fetches the specified NPM package from the NPM registry. */
async function fetchPackageInfoFromNpmRegistry(pkgName: string): Promise<NpmPackageInfo> {
  if (_npmPackageInfoCache[pkgName] === undefined) {
    _npmPackageInfoCache[pkgName] = fetch(`https://registry.npmjs.org/${pkgName}`).then(
      (r) => r.json() as Promise<NpmPackageInfo>,
    );
  }
  return await _npmPackageInfoCache[pkgName];
}
