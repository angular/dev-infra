/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 *
 * Module loader that augments NodeJS's execution to:
 *
 * - support native execution of Angular JavaScript output
 *   that isn't strict ESM at this point (lack of explicit extensions).
 * - support path mappings at runtime. This allows us to natively execute ESM
 *   without having to pre-bundle for testing, or use the slow full npm linked packages
 */

import {parseTsconfig, createPathsMatcher} from 'get-tsconfig';

import path from 'node:path';

const explicitExtensionRe = /\.[mc]?js$/;
const nonModuleImportRe = /^[.\/]/;

const runfilesRoot = process.env.JS_BINARY__RUNFILES;
const tsconfigPath = process.env.NODE_OPTIONS_TSCONFIG_PATH;

let pathMappingMatcher;
// When no tsconfig is provided no match can be generated so we always return an empty list.
if (tsconfigPath === undefined) {
  pathMappingMatcher = () => [];
} else {
  const tsconfigFullPath = path.join(runfilesRoot, tsconfigPath);
  const tsconfig = parseTsconfig(tsconfigFullPath);
  pathMappingMatcher = createPathsMatcher({config: tsconfig, path: tsconfigFullPath});
}

/** @type {import('module').ResolveHook} */
export const resolve = async (specifier, context, nextResolve) => {
  // True when it's a non-module import without explicit extensions.
  const isNonModuleExtensionlessImport =
    nonModuleImportRe.test(specifier) && !explicitExtensionRe.test(specifier);
  const pathMappings = !nonModuleImportRe.test(specifier) ? pathMappingMatcher(specifier) : [];

  // If it's neither path mapped, nor an extension-less import that may be fixed up, exit early.
  if (!isNonModuleExtensionlessImport && pathMappings.length === 0) {
    return nextResolve(specifier, context);
  }

  if (pathMappings.length > 0) {
    for (const mapping of pathMappings) {
      const res = await resolve(mapping, context, nextResolve).catch(() => null);
      if (res !== null) {
        return res;
      }
    }
  } else {
    const specifiers = [
      `${specifier}.js`,
      `${specifier}/index.js`,
      // Legacy variants for the `zone.js` variant using still `ts_library`.
      // TODO(rules_js migration): Remove this.
      `${specifier}.mjs`,
      `${specifier}/index.mjs`,
    ];
    for (const specifier of specifiers) {
      try {
        return await nextResolve(specifier, context);
      } catch {}
    }
  }
  return nextResolve(specifier, context);
};
