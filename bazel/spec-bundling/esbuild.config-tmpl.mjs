/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Loads and creates the ESBuild linker plugin.
 *
 * The plugin is not loaded at top-level as not all spec bundle targets rely
 * on the linker and this would slow-down bundling.
 */
async function fetchAndCreateLinkerEsbuildPlugin() {
  // Note: This needs to be a NPM module path as this ESBuild config is generated and can
  // end up in arbitrary Bazel packages or differently-named consumer workspaces.
  const {createLinkerEsbuildPlugin} = await import(
    '@angular/build-tooling/shared-scripts/angular-linker/esbuild-plugin.mjs'
  );
  return await createLinkerEsbuildPlugin(/.*/, /* ensureNoPartialDeclaration */ true, {
    unknownDeclarationVersionHandling: TMPL_LINKER_UNKNOWN_DECLARATION_HANDLING,
  });
}

// Based on the Bazel action and its substitutions, we run the linker for all inputs.
const plugins = TMPL_RUN_LINKER ? [await fetchAndCreateLinkerEsbuildPlugin()] : [];

// List of supported features as per ESBuild. See:
// https://esbuild.github.io/api/#supported.
const supported = {};

// Async/Await can be downleveled so that ZoneJS can intercept. See:
// https://github.com/angular/angular-cli/blob/afe9feaa45913/packages/angular_devkit/build_angular/src/builders/browser-esbuild/index.ts#L313-L318.
if (TMPL_DOWNLEVEL_ASYNC_AWAIT) {
  supported['async-await'] = false;
}

export default {
  // `tslib` sets the `module` condition to resolve to ESM.
  conditions: ['es2020', 'es2015', 'module'],
  // This ensures that we prioritize ES2020. RxJS would otherwise use the ESM5 output.
  mainFields: ['es2020', 'es2015', 'module', 'main'],
  // Addition of `.mjs` to the non-jsx defaults. https://esbuild.github.io/api/#resolve-extensions
  resolveExtensions: ['.mjs', '.js', '.json'],
  supported,
  plugins,
};
