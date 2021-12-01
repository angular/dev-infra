/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';

import {createEsbuildAngularOptimizePlugin} from '@angular/dev-infra-private/shared-scripts/angular-optimization/esbuild-plugin.mjs';
import {createEs2015LinkerPlugin} from '@angular/compiler-cli/linker/babel';
import {ConsoleLogger, NodeJSFileSystem, LogLevel} from '@angular/compiler-cli';
import {GLOBAL_DEFS_FOR_TERSER_WITH_AOT} from '@angular/compiler-cli/private/tooling';

/** Root path pointing to the app bundle source entry-point file. */
const entryPointSourceRootPath = path.normalize(`TMPL_ENTRY_POINT_ROOTPATH`);

/**
 * Root path to the bundle entry-point without extension.
 *
 * The extension of the bundle entry-point file is not known because the ESBuild rule
 * strips the source extension (like `.ts`) and resolves the file based on the resolved inputs.
 */
const entryPointBasepath = entryPointSourceRootPath.replace(/\.[^.]+$/, '');

/** Whether the given file is considered side-effect free. */
function isFileSideEffectFree(filePath) {
  // All files except for the entry-point are considered side-effect free. We naively
  // check using `includes` as a root path is quite unique regardless.
  return !filePath.includes(entryPointBasepath);
}

/** Babel plugin running the Angular linker. */
const linkerBabelPlugin = createEs2015LinkerPlugin({
  fileSystem: new NodeJSFileSystem(),
  logger: new ConsoleLogger(LogLevel.warn),
  linkerJitMode: false,
});

export default {
  // Note: We prefer `.mjs` here as this is the extension used by Angular APF packages.
  resolveExtensions: ['.mjs', '.js'],
  conditions: ['es2020', 'es2015'],
  mainFields: ['fesm2020', 'es2020', 'es2015', 'module', 'main'],
  // The majority of these options match with the ones the CLI sets:
  // https://github.com/angular/angular-cli/blob/0d76bf04bca6e083865972b5398a32bbe9396e14/packages/angular_devkit/build_angular/src/webpack/plugins/javascript-optimizer-worker.ts#L133.
  treeShaking: true,
  pure: ['forwardRef'],
  legalComments: 'none',
  // ESBuild requires the `define` option to take a string-based dictionary.
  define: convertObjectToStringDictionary(GLOBAL_DEFS_FOR_TERSER_WITH_AOT),
  plugins: [createEsbuildAngularOptimizePlugin(isFileSideEffectFree, [linkerBabelPlugin])],
};

/** Converts an object to a string dictionary. */
function convertObjectToStringDictionary(value) {
  return Object.entries(value).reduce((result, [propName, value]) => {
    result[propName] = String(value);
    return result;
  }, {});
}
