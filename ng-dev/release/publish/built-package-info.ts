/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {hashElement} from 'folder-hash';
import {Log} from '../../utils/logging';

import {BuiltPackage, BuiltPackageWithInfo, NpmPackage} from '../config';
import {FatalReleaseActionError} from './actions-error';
import {DirectoryHash} from './directory-hash';

/**
 * Analyzes and extends the given built packages with additional information,
 * such as their corresponding NPM information or a hash for the package contents.
 */
export async function analyzeAndExtendBuiltPackagesWithInfo(
  builtPackages: BuiltPackage[],
  npmPackages: NpmPackage[],
): Promise<BuiltPackageWithInfo[]> {
  const result: BuiltPackageWithInfo[] = [];

  // Note: We sequentially analyze/extend the built packages as we would not want
  // to risk too many file system operations at the same time. Since workspaces
  // do not have a lot of packages, this operation is fine to run sequentially.
  for (const pkg of builtPackages) {
    const info = npmPackages.find((i) => i.name === pkg.name);

    if (info === undefined) {
      Log.debug(`Retrieved package information:`, npmPackages);
      Log.error(`  ✘   Could not find package information for built package: "${pkg.name}".`);
      throw new FatalReleaseActionError();
    }

    result.push({
      hash: await computeHashForPackageContents(pkg),
      ...pkg,
      ...info,
    });
  }

  return result;
}

/**
 * Asserts that the expected built package content matches the disk
 * contents of the built packages.
 *
 * @throws {FatalReleaseActionError} When the integrity check failed.
 */
export async function assertIntegrityOfBuiltPackages(
  builtPackagesWithInfo: BuiltPackageWithInfo[],
): Promise<void> {
  const modifiedPackages: string[] = [];

  // Note: This runs sequentially for the same reason when we analyze/extend the
  // built package info. See `analyzeAndExtendBuiltPackagesWithInfo`.
  for (const pkg of builtPackagesWithInfo) {
    if ((await computeHashForPackageContents(pkg)) !== pkg.hash) {
      modifiedPackages.push(pkg.name);
    }
  }

  if (modifiedPackages.length > 0) {
    Log.error(`  ✘   Release output has been modified locally since it was built.`);
    Log.error(`      The following packages changed: ${modifiedPackages.join(', ')}`);
    throw new FatalReleaseActionError();
  }
}

/** Computes a deterministic hash for the package and its contents. */
async function computeHashForPackageContents(pkg: BuiltPackage): Promise<string> {
  return DirectoryHash.compute(pkg.outputPath);
}
