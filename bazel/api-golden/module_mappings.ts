/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';

import {runfiles} from '@bazel/runfiles';

/** Regular expression that matches a scoped type package name. */
const scopedTypesPackageRegex = /^@types\/([^_\/]+)__(.+)/;

/**
 * Resolves type modules and returns corresponding path mappings and a
 * list of referenced files.
 */
export function resolveTypeModules(typeModuleNames: string[]): {
  paths: Record<string, string[]>;
  typeFiles: string[];
} {
  const typeFiles = [];
  const paths: Record<string, string[]> = {};

  for (const moduleName of typeModuleNames) {
    const resolvedModuleDir = resolveNodeModuleToDirectory(moduleName);
    const scopedAlternativeName = getScopedNameFromTypeName(moduleName);

    // It's a naive assumption that type files exist directly in `index.d.ts` of
    // the package. The file does not necessarily exist but this assumption is
    // sufficient for our current needs. API golden tests rarely rely on global types.
    typeFiles.push(path.join(resolvedModuleDir, 'index.d.ts'));

    paths[moduleName] = [resolvedModuleDir];

    if (scopedAlternativeName !== null) {
      paths[scopedAlternativeName] = paths[moduleName];
    }
  }

  return {paths, typeFiles};
}

/**
 * Gets the scoped module name from a type package, if available.
 * e.g. for `@types/babel__core` this returns `@babel/core`.
 */
function getScopedNameFromTypeName(name: string): string | null {
  const matches = name.match(scopedTypesPackageRegex);

  if (matches === null) {
    return null;
  }

  return `@${matches[1]}/${matches[2]}`;
}

/** Resolves a node module to an absolute file directory path. */
function resolveNodeModuleToDirectory(moduleName: string): string {
  return runfiles.resolve(`npm/node_modules/${moduleName}/`);
}
