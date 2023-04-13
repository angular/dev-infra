/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createEsbuildAngularOptimizePlugin} from '@angular/build-tooling/shared-scripts/angular-optimization/esbuild-plugin.mjs';

// List of supported features as per ESBuild. See:
// https://esbuild.github.io/api/#supported.
const supported = {};

const downlevelAsyncAwait = TMPL_DOWNLEVEL_ASYNC_AWAIT;

// Async/Await can be downleveled so that ZoneJS can intercept. See:
// https://github.com/angular/angular-cli/blob/afe9feaa45913/packages/angular_devkit/build_angular/src/builders/browser-esbuild/index.ts#L313-L318.
if (downlevelAsyncAwait) {
  supported['async-await'] = false;
}

export default {
  // `tslib` sets the `module` condition to resolve to ESM.
  conditions: ['es2022', 'module'],
  // This ensures that we prioritize ES2020. RxJS would otherwise use the ESM5 output.
  mainFields: ['es2022', 'module', 'main'],
  // Addition of `.mjs` to the non-jsx defaults. https://esbuild.github.io/api/#resolve-extensions
  resolveExtensions: ['.mjs', '.js', '.json'],
  // Bundling specs may result in classes being aliased to avoid collisions. e.g. when
  // everything is bundled into a single AMD bundle. To avoid test failures for assertions
  // on symbol names, we instruct ESBuild to keep original names. See:
  // https://esbuild.github.io/api/#keep-names.
  keepNames: true,
  supported,
  plugins: [
    await createEsbuildAngularOptimizePlugin({
      optimize: undefined,
      downlevelAsyncGeneratorsIfPresent: downlevelAsyncAwait,
      enableLinker: TMPL_RUN_LINKER
        ? {
            ensureNoPartialDeclaration: true,
            linkerOptions: {
              // JIT mode is needed for tests overriding components/modules etc.
              linkerJitMode: true,
              unknownDeclarationVersionHandling: TMPL_LINKER_UNKNOWN_DECLARATION_HANDLING,
            },
          }
        : undefined,
    }),
  ],
};
