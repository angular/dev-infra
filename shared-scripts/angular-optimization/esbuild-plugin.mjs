/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import adjustStaticClassMembersPlugin from '@angular-devkit/build-angular/src/babel/plugins/adjust-static-class-members.js';
import elideAngularMetadataPlugin from '@angular-devkit/build-angular/src/babel/plugins/elide-angular-metadata.js';
import adjustTypeScriptEnumsPlugin from '@angular-devkit/build-angular/src/babel/plugins/adjust-typescript-enums.js';
import pureToplevelFunctionsPlugin from '@angular-devkit/build-angular/src/babel/plugins/pure-toplevel-functions.js';
import babel from '@babel/core';

/**
 * Creates an ESBuild plugin that configures various Angular optimization Babel plugins.
 * The Babel plugins configured usually run in the Angular CLI compilation pipeline.
 *
 * @param isSideEffectFreeFn Function that takes an absolute file path and determines
 *   whether it is side-effect free or not. If unspecified, ESBuild will have to determine
 *   unused side-effect invocations itself.
 * @param additionalBabelPlugins List of additional Babel plugins that should run as part
 *   of this ESBuild plugin. This is primarily supported for reducing the amount of ESBuild
 *   load plugins needed (as they can impact performance significantly).
 */
export function createEsbuildAngularOptimizePlugin(
  isSideEffectFreeFn = null,
  additionalBabelPlugins = [],
) {
  return {
    name: 'ng-babel-optimize-esbuild',
    setup: (build) => {
      build.onLoad({filter: /.*/}, async (args) => {
        const filePath = args.path;
        const content = await fs.promises.readFile(filePath, 'utf8');
        const plugins = [
          ...additionalBabelPlugins,
          adjustStaticClassMembersPlugin,
          elideAngularMetadataPlugin,
          adjustTypeScriptEnumsPlugin,
        ];

        // If the current file is denoted as explicit side effect free, add the pure
        // top-level functions optimization plugin for this file.
        if (isSideEffectFreeFn !== null && isSideEffectFreeFn(args.path)) {
          plugins.push(pureToplevelFunctionsPlugin);
        }

        const {code} = await babel.transformAsync(content, {
          filename: filePath,
          filenameRelative: filePath,
          plugins: plugins,
          // Sourcemaps are generated inline so that ESBuild can process them.
          sourceMaps: 'inline',
          compact: false,
        });

        return {contents: code};
      });
    },
  };
}
