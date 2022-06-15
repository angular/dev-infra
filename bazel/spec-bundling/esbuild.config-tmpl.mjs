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
    '@angular/dev-infra-private/shared-scripts/angular-linker/esbuild-plugin.mjs'
  );
  return await createLinkerEsbuildPlugin(/.*/, /* ensureNoPartialDeclaration */ true);
}

// Based on the Bazel action and its substitutions, we run the linker for all inputs.
const plugins = TMPL_RUN_LINKER ? [await fetchAndCreateLinkerEsbuildPlugin()] : [];

export default {
  // `tslib` sets the `module` condition to resolve to ESM.
  conditions: ['es2020', 'es2015', 'module'],
  // This ensures that we prioritize ES2020. RxJS would otherwise use the ESM5 output.
  mainFields: ['es2020', 'es2015', 'module', 'main'],
  plugins,
};
