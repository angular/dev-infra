/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import {NodeJSFileSystem, ConsoleLogger, LogLevel} from '@angular/compiler-cli';
import {createEs2015LinkerPlugin} from '@angular/compiler-cli/linker/babel';
import babel from '@babel/core';

/** Naively checks whether this node path resolves to an Angular declare invocation. */
function isNgDeclareCallExpression(nodePath) {
  if (!nodePath.node.name.startsWith('ɵɵngDeclare')) {
    return false;
  }

  // Expect the `ngDeclare` identifier to be used as part of a property access that
  // is invoked within a call expression. e.g. `i0.ɵɵngDeclare<>`.
  return (
    nodePath.parentPath?.type === 'MemberExpression' &&
    nodePath.parentPath.parentPath?.type === 'CallExpression'
  );
}

/** Asserts that the given AST does not contain any Angular partial declaration. */
async function assertNoPartialDeclaration(filePath, ast, traverseFn) {
  // Naively check if there are any Angular declarations left that haven't been linked.
  traverseFn(ast, {
    Identifier: (astPath) => {
      if (isNgDeclareCallExpression(astPath)) {
        throw astPath.buildCodeFrameError(
          `Found Angular declaration that has not been linked. ${filePath}`,
          Error,
        );
      }
    },
  });
}

/**
 * Creates an ESBuild plugin for running the Angular linker resolved sources.
 *
 * @param filter Mandatory file path filter for the ESBuild plugin to apply to. Read
 *   more here: https://esbuild.github.io/plugins/#filters.
 * @param ensureNoPartialDeclaration Whether an additional check ensuring there are
 *   no partial declarations should run.
 * @param linkerOptions configuration options for the linker environment.
 *   See: https://github.com/angular/angular/blob/master/packages/compiler-cli/linker/src/file_linker/linker_options.ts
 */
export async function createLinkerEsbuildPlugin(
  filter,
  ensureNoPartialDeclaration,
  linkerOptions = {},
) {
  const linkerBabelPlugin = createEs2015LinkerPlugin({
    fileSystem: new NodeJSFileSystem(),
    logger: new ConsoleLogger(LogLevel.warn),
    // We enable JIT mode as unit tests also will rely on the linked ESM files.
    linkerJitMode: true,
    // Workaround for https://github.com/angular/angular/issues/42769 and https://github.com/angular/angular-cli/issues/22647.
    sourceMapping: false,
    ...linkerOptions,
  });

  return {
    name: 'ng-linker-esbuild',
    setup: (build) => {
      build.onLoad({filter}, async (args) => {
        const filePath = args.path;
        const content = await fs.promises.readFile(filePath, 'utf8');
        const {ast, code} = await babel.transformAsync(content, {
          filename: filePath,
          filenameRelative: filePath,
          plugins: [linkerBabelPlugin],
          sourceMaps: 'inline',
          ast: true,
          compact: false,
        });

        if (ensureNoPartialDeclaration) {
          await assertNoPartialDeclaration(filePath, ast, babel.traverse);
        }

        return {contents: code};
      });
    },
  };
}
