/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerState} from '@microsoft/api-extractor';
import ts from 'typescript';

const _originalCreateCompilerHost = CompilerState['_createCompilerHost'];

/**
 * Patches the API extractor TS host to ensures that it never accidentally
 * leaks to `node_modules`.
 *
 * This would be problematic as API extractor could end up resolves differently
 * with `bazel test` and `bazel run`. Bazel test runs with a sandbox where
 * node modules are not discoverable through parent directory traversal.
 */
export function patchHostToSkipNodeModules() {
  CompilerState['_createCompilerHost'] = (...args: any[]) => {
    const host = _originalCreateCompilerHost.apply(CompilerState, args) as ts.CompilerHost;
    const moduleResolutionCache = ts.createModuleResolutionCache(
      host.getCurrentDirectory(),
      host.getCanonicalFileName.bind(host),
    );

    host.resolveModuleNames = (
      moduleNames,
      containingFile,
      _reusedNames,
      redirectedReference,
      options,
    ) => {
      return moduleNames.map((moduleName) => {
        const module = ts.resolveModuleName(
          moduleName,
          containingFile,
          options,
          host,
          moduleResolutionCache,
          redirectedReference,
        );
        const resolvedModule = module.resolvedModule;
        const resolvedFileName = resolvedModule?.resolvedFileName;

        // If the module is resolving to a node modules that is not part of a Bazel repository,
        // throw away the resolved module. Modules resolved specifically into the Bazel node managed
        // node modules are intentionally kept to support the `types = ` Starklark option.
        if (
          resolvedFileName !== undefined &&
          resolvedFileName.includes('/node_modules/') &&
          resolvedFileName.includes('npm/node_modules')
        ) {
          return undefined;
        }
        return resolvedModule;
      });
    };
    return host;
  };
}
