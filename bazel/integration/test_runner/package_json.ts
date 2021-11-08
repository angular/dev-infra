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

  updateMappingForRecord(newPackageJson, 'dependencies', mappings);
  updateMappingForRecord(newPackageJson, 'devDependencies', mappings);
  updateMappingForRecord(newPackageJson, 'optionalDependencies', mappings);
  // The object for Yarn resolutions will not directly match with the mapping keys
  // specified here, as resolutions usually follow a format as followed:
  //  1. `**/<pkg-name>`
  //  2. `<other-pkg>/**/<pkg-name>`
  //  3. `<pkg-name>`
  // More details here: https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/.
  // We pass a regular expression which matches the `<pkg-name>` so that the mappings can
  // be applied for resolutions as well.
  updateMappingForRecord(newPackageJson, 'resolutions', mappings, /([^/]+)$/);

  return newPackageJson;
}

/**
 * Updates dependencies for the dependency record to respect the specified
 * package mappings. The record is updated in-place.
 *
 * @throws An error if there is a dependency entry referring to a local file. Such
 *   entries should not use `file:` but instead configure a mapping through Bazel.
 */
function updateMappingForRecord(
  pkgJson: PackageJson,
  recordName: keyof PackageJson,
  mappings: PackageMappings,
  nameMatchRegex?: RegExp,
) {
  const record = pkgJson[recordName] ?? {};

  for (const [entryKey, value] of Object.entries(record)) {
    const pkgName = getPackageNameFromDependencyEntry(entryKey, nameMatchRegex);

    if (pkgName === null) {
      throw Error(`Could not determine package name for "${recordName}" entry: ${entryKey}.`);
    }

    // Print the resolved package name to ease debugging when packages are not mapped properly.
    debug(`updateMappingForRecord: Resolved "${recordName}@${entryKey}" to package: ${pkgName}`);

    const mappedAbsolutePath = mappings[pkgName];

    // If the value of the dependency entry is referring to a local file, then we report
    // an error as this is likely a missing mapping that should be set up through Bazel.
    if (mappedAbsolutePath === undefined && value.startsWith(`file:`)) {
      throw Error(
        `Unexpected dependency entry for: ${entryKey}, pointing to: ${value}. ` +
          `Instead, configure the mapping through the integration test Bazel target.`,
      );
    }

    // There is no mapping for this entry, so we continue iterating through deps.
    if (mappedAbsolutePath === undefined) {
      continue;
    }

    record[entryKey] = mappedAbsolutePath;
  }
}

/**
 * Gets the package name from a dependency record entry.
 *
 * @param entryKey Key of the dependency record entry.
 * @param nameMatchRegex Optional regular expression that can be specified to match the package
 *   name in a dependency entry. This is useful for e.g. Yarn resolutions using patterns.
 *   The first capturing group is expected to return the matched package name.
 */
function getPackageNameFromDependencyEntry(
  entryKey: string,
  nameMatchRegex?: RegExp,
): string | null {
  if (nameMatchRegex) {
    const matches = entryKey.match(nameMatchRegex);
    return matches === null ? null : matches[1];
  }
  return entryKey;
}
