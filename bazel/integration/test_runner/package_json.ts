/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import {debug} from './debug';

/** Record capturing dependencies in a `package.json`. */
export type DependencyRecord = Record<string, string>;

/** Record mapping an NPM package to an absolute file path (usually a tarball). */
export type PackageMappings = Record<string, string>;

export interface PackageJson {
  dependencies: DependencyRecord | undefined;
  devDependencies: DependencyRecord | undefined;
  optionalDependencies: DependencyRecord | undefined;
  resolutions: DependencyRecord | undefined;
}

/**
 * Reads the `package.json` file at the specified location.
 * @returns The parsed `package.json` contents, or `null` if the file
 *   could not be found or read.
 */
export async function readPackageJsonContents(filePath: string): Promise<PackageJson | null> {
  try {
    return JSON.parse(await fs.promises.readFile(filePath, 'utf8')) as PackageJson;
  } catch (e) {
    debug(`Could not read: ${filePath}. Error: ${e}`);
    return null;
  }
}

/**
 * Updates dependencies in the specified `package.json` to the given
 * package mappings. Returns a new `PackageJson` object for the updated file.
 *
 * @throws An error if there is a dependency entry referring to a local file. Such
 *   entries should not use `file:` but instead configure a mapping through Bazel.
 */
export function updateMappingsForPackageJson(
  packageJson: Readonly<PackageJson>,
  mappings: PackageMappings,
): PackageJson {
  const newPackageJson = {...packageJson};

  updateMappingForRecord(newPackageJson.dependencies ?? {}, mappings);
  updateMappingForRecord(newPackageJson.devDependencies ?? {}, mappings);
  updateMappingForRecord(newPackageJson.optionalDependencies ?? {}, mappings);
  updateMappingForRecord(newPackageJson.resolutions ?? {}, mappings);

  return newPackageJson;
}

/**
 * Updates dependencies for the dependency record to respect the specified
 * package mappings. The record is updated in-place.
 *
 * @throws An error if there is a dependency entry referring to a local file. Such
 *   entries should not use `file:` but instead configure a mapping through Bazel.
 */
function updateMappingForRecord(record: DependencyRecord, mappings: PackageMappings) {
  for (const [pkgName, value] of Object.entries(record)) {
    const mappedAbsolutePath = mappings[pkgName];

    // If the value of the dependency entry is referring to a local file, then we report
    // an error as this is likely a missing mapping that should be set up through Bazel.
    if (mappedAbsolutePath === undefined && value.startsWith(`file:`)) {
      throw Error(
        `Unexpected dependency entry for: ${pkgName}, pointing to: ${value}.` +
          `Instead, configure the mapping through the integration test Bazel target.`,
      );
    }

    // There is no mapping for this entry, so we continue iterating through deps.
    if (mappedAbsolutePath === undefined) {
      continue;
    }

    record[pkgName] = mappedAbsolutePath;
  }
}
