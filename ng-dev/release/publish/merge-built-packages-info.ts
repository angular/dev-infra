/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BuiltPackage, NpmPackage} from '../config';
import {debug, error, red} from '../../utils/console';
import {FatalReleaseActionError} from './actions-error';

/** Type describing a built package with its associated NPM package info. */
export interface BuiltPackageWithInfo extends BuiltPackage, NpmPackage {}

/** Merges the given built packages with their NPM package information. */
export function mergeBuiltPackagesWithInfo(
  builtPackages: BuiltPackage[],
  npmPackages: NpmPackage[],
): BuiltPackageWithInfo[] {
  return builtPackages.map((pkg) => {
    const info = npmPackages.find((i) => i.name === pkg.name);

    if (info === undefined) {
      debug(`Retrieved package information:`, npmPackages);
      error(red(`  ✘   Could not find package information for built package: "${pkg.name}".`));
      throw new FatalReleaseActionError();
    }

    return {...pkg, ...info};
  });
}
