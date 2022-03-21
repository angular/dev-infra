/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join, normalize} from 'path';

import {readFileSync} from 'fs';

/** Interface describing a resolved NPM package entry point. */
export interface PackageEntryPoint {
  typesEntryPointPath: string;
  subpath: string;
  moduleName: string;
}

/** Interface describing contents of a `package.json`. */
interface PackageJson {
  name: string;
  exports?: Record<string, {types?: string}>;
}

/** Finds all entry points within a given NPM package directory. */
export function findEntryPointsWithinNpmPackage(
  dirPath: string,
  packageJsonPath: string,
): PackageEntryPoint[] {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson;
  const entryPoints: PackageEntryPoint[] = [];

  if (packageJson.exports === undefined) {
    throw new Error(
      `Expected top-level "package.json" in "${dirPath}" to declare entry-points ` +
        `through conditional exports.`,
    );
  }

  for (const [subpath, conditions] of Object.entries(packageJson.exports)) {
    if (conditions.types !== undefined) {
      entryPoints.push({
        subpath,
        moduleName: normalize(join(packageJson.name, subpath)).replace(/\\/g, '/'),
        typesEntryPointPath: join(dirPath, conditions.types),
      });
    }
  }

  return entryPoints;
}
