/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirname, isAbsolute, join, relative} from 'path';
import {lstatSync, readFileSync, readdirSync} from 'fs';

import {PackageJson} from './index_npm_packages.cjs';

/** Interface describing a resolved NPM package entry point. */
export interface PackageEntryPoint {
  typesEntryPointPath: string;
  subpath: string;
}

/** Finds all entry points within a given NPM package directory. */
export function findEntryPointsWithinNpmPackage(
  dirPath: string,
  packageJson: PackageJson,
): PackageEntryPoint[] {
  // Legacy behavior to support Angular packages without the `exports` field.
  // TODO: Remove when https://github.com/angular/angular-cli/issues/22889 is resolved.
  if (packageJson.exports === undefined) {
    return findEntryPointsThroughNestedPackageFiles(dirPath);
  }

  const entryPoints: PackageEntryPoint[] = [];
  for (const [subpath, {types}] of Object.entries(packageJson.exports)) {
    // Wildcard types mappings are supported.
    if (types !== undefined && !types.includes('*')) {
      if (isAbsolute(subpath) || subpath.split(/[/\\]/).includes('..')) {
        throw new Error(`Invalid exports subpath: ${subpath}`);
      }
      if (isAbsolute(types) || types.split(/[/\\]/).includes('..')) {
        throw new Error(`Invalid types entry point: ${types}`);
      }

      const resolvedSubpath = join(dirPath, subpath);
      const relativeSubpath = relative(dirPath, resolvedSubpath);
      if (relativeSubpath.startsWith('..') || isAbsolute(relativeSubpath)) {
        throw new Error(`Subpath resolves outside package directory: ${subpath}`);
      }

      const resolvedTypesPath = join(dirPath, types);
      const relativeTypes = relative(dirPath, resolvedTypesPath);
      if (relativeTypes.startsWith('..') || isAbsolute(relativeTypes)) {
        throw new Error(`Types entry point resolves outside package directory: ${types}`);
      }

      entryPoints.push({
        subpath,
        typesEntryPointPath: resolvedTypesPath,
      });
    }
  }

  return entryPoints;
}

/**
 * Finds all entry points within a given NPM package directory by looking
 * for nested `package.json` files. This is a legacy mechanism since we can
 * consult the `package.json` `exports` information in most cases.
 */
function findEntryPointsThroughNestedPackageFiles(dirPath: string): PackageEntryPoint[] {
  const entryPoints: PackageEntryPoint[] = [];

  for (const packageJsonFilePath of findPackageJsonFilesInDirectory(dirPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonFilePath, 'utf8')) as PackageJson;
    const subpath = relative(dirPath, dirname(packageJsonFilePath));
    const typesFile = packageJson.types || packageJson.typings;

    if (typesFile) {
      entryPoints.push({
        subpath,
        typesEntryPointPath: join(dirname(packageJsonFilePath), typesFile),
      });
    }
  }

  return entryPoints;
}

/** Determine if the provided path is a directory. */
function isDirectory(dirPath: string) {
  try {
    return lstatSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/** Finds all `package.json` files within a directory. */
function* findPackageJsonFilesInDirectory(directoryPath: string): IterableIterator<string> {
  for (const fileName of readdirSync(directoryPath)) {
    const fullPath = join(directoryPath, fileName);
    if (isDirectory(fullPath)) {
      yield* findPackageJsonFilesInDirectory(fullPath);
    } else if (fileName === 'package.json') {
      yield fullPath;
    }
  }
}
