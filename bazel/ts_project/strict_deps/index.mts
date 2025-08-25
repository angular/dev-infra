/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isBuiltin} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import {createDiagnostic} from './diagnostic.mjs';
import {StrictDepsManifest} from './manifest.mjs';
import {getImportsInSourceFile} from './visitor.mjs';
import {readTsConfig} from './tsconfig.mjs';

const [manifestExecPath, expectedFailureRaw] = process.argv.slice(2);
const expectedFailure = expectedFailureRaw === 'true';

const manifest: StrictDepsManifest = JSON.parse(await fs.readFile(manifestExecPath, 'utf8'));

/**
 * Regex matcher to extract a npm package name, potentially with scope from a subpackage import path.
 */
const moduleSpeciferMatcher = /^(@[\w\d-_\.]+\/)?([\w\d-_\.]+)/;
const extensionRemoveRegex = /\.[mc]?(js|(d\.)?[mc]?tsx?)$/;
const allowedModuleNames = new Set<string>(
  manifest.allowedModuleNames.map((m) => {
    return (
      m
        // Scoped types from DefinitelyTyped are split using a __ delimiter, so we put it back together.
        .replace(/(?:@types\/)(.*)__(.*)/, '@$1/$2')
        // Replace any unscoped types package from DefinitelyTyped with just to package name.
        .replace(/(?:@types\/)(.*)/, '$1')
    );
  }),
);
const allowedSources = new Set<string>(
  manifest.allowedSources.map((s) => s.replace(extensionRemoveRegex, '')),
);
const tsconfig = readTsConfig(path.join(process.cwd(), manifest.tsconfigPath));
const diagnostics: ts.Diagnostic[] = [];

/** Check if the moduleSpecifier matches any of the provided paths. */
function checkPathsForMatch(moduleSpecifier: string, paths?: ts.MapLike<string[]>): boolean {
  for (const matcher of Object.keys(paths || {})) {
    if (new RegExp(matcher).test(moduleSpecifier)) {
      return true;
    }
  }
  return false;
}

/** The list of known package names that end with extensions and need to be special cased. */
const knownModuleSpecifiersWithExtensions = new Set(['highlight.js', 'zone.js']);

for (const fileExecPath of manifest.testFiles) {
  const imports = getImportsInSourceFile(fileExecPath);

  for (const i of imports) {
    const moduleSpecifier = knownModuleSpecifiersWithExtensions.has(i.moduleSpecifier)
      ? i.moduleSpecifier
      : i.moduleSpecifier.replace(extensionRemoveRegex, '');
    // When the module specified is the file itself this is always a valid dep.
    if (i.moduleSpecifier === '') {
      continue;
    }
    if (moduleSpecifier.startsWith('.')) {
      const targetFilePath = path.posix.join(
        path.dirname(i.diagnosticNode.getSourceFile().fileName),
        moduleSpecifier,
      );

      if (allowedSources.has(targetFilePath) || allowedSources.has(`${targetFilePath}/index`)) {
        continue;
      }
    }

    if (
      isBuiltin(moduleSpecifier) &&
      (allowedModuleNames.has('node') || tsconfig.options.types?.includes('node'))
    ) {
      continue;
    }

    if (
      allowedModuleNames.has(moduleSpecifier.match(moduleSpeciferMatcher)?.[0] || '') ||
      allowedModuleNames.has(moduleSpecifier)
    ) {
      continue;
    }

    if (checkPathsForMatch(moduleSpecifier, tsconfig.options.paths)) {
      continue;
    }

    diagnostics.push(
      createDiagnostic(`No explicit Bazel dependency for this module.`, i.diagnosticNode),
    );
  }
}

if (diagnostics.length > 0) {
  const formattedDiagnostics = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (f) => f,
    getCurrentDirectory: () => '',
    getNewLine: () => '\n',
  });
  console.error(formattedDiagnostics);
  process.exitCode = 1;
}

if (expectedFailure && process.exitCode !== 0) {
  console.log('Strict deps testing was marked as expected to fail, marking test as passing.');
  // Force the exit code back to 0 as the process was expected to fail.
  process.exitCode = 0;
}
