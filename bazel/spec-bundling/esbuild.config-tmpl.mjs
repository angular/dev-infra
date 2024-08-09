/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const downlevelAsyncAwait = TMPL_DOWNLEVEL_ASYNC_AWAIT;
const enableLinker = TMPL_RUN_LINKER;

// List of esbuild plugins.
const plugins = [];
if (enableLinker || downlevelAsyncAwait) {
  const {createEsbuildAngularOptimizePlugin} = await import(
    '@angular/build-tooling/shared-scripts/angular-optimization/esbuild-plugin.mjs'
  );

  plugins.push(
    await createEsbuildAngularOptimizePlugin({
      optimize: undefined,
      downlevelAsyncGeneratorsIfPresent: downlevelAsyncAwait,
      enableLinker: enableLinker
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
  );
}

// List of supported features as per ESBuild. See:
// https://esbuild.github.io/api/#supported.
const supported = {};

// Async/Await can be downleveled so that ZoneJS can intercept. See:
// https://github.com/angular/angular-cli/blob/afe9feaa45913/packages/angular_devkit/build_angular/src/builders/browser-esbuild/index.ts#L313-L318.
if (downlevelAsyncAwait) {
  supported['async-await'] = false;
}

export default {
  // Based on the CLI configuration:
  // https://github.com/angular/angular-cli/blame/8089c9388056b3caaf56f981848aca94f022da73/packages/angular_devkit/build_angular/src/tools/esbuild/application-code-bundle.ts#L51.
  conditions: ['es2022', 'es2020', 'es2015', 'module'],
  // Note: ES2015 main condition is needed for `rxjs@v6`.
  mainFields: ['fesm2022', 'es2022', 'es2020', 'es2015', 'module', 'main'],
  // Addition of `.mjs` to the non-jsx defaults.
  // https://esbuild.github.io/api/#resolve-extensions
  resolveExtensions: ['.mjs', '.js', '.json'],
  // Bundling specs may result in classes being aliased to avoid collisions. e.g. when
  // everything is bundled into a single AMD bundle. To avoid test failures for assertions
  // on symbol names, we instruct ESBuild to keep original names. See:
  // https://esbuild.github.io/api/#keep-names.
  keepNames: true,
  supported,
  plugins,
};
