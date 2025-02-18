import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import {createDiagnostic} from './diagnostic.mjs';
import {StrictDepsManifest} from './manifest.mjs';
import {getImportsInSourceFile} from './visitor.mjs';

const [manifestExecPath, expectedFailureRaw] = process.argv.slice(2);
const expectedFailure = expectedFailureRaw === 'true';

const manifest: StrictDepsManifest = JSON.parse(await fs.readFile(manifestExecPath, 'utf8'));

/**
 * Regex matcher to extract a npm package name, potentially with scope from a subpackage import path.
 */
const moduleSpeciferMatcher = /^(@[\w\d-_]+\/)?([\w\d-_]+)/;
const extensionRemoveRegex = /\.[mc]?(js|(d\.)?ts)$/;
const allowedModuleNames = new Set<string>(manifest.allowedModuleNames);
const allowedSources = new Set<string>(
  manifest.allowedSources.map((s) => s.replace(extensionRemoveRegex, '')),
);

const diagnostics: ts.Diagnostic[] = [];

for (const fileExecPath of manifest.testFiles) {
  const content = await fs.readFile(fileExecPath, 'utf8');
  const sf = ts.createSourceFile(fileExecPath, content, ts.ScriptTarget.ESNext, true);
  const imports = getImportsInSourceFile(sf);

  for (const i of imports) {
    const moduleSpecifier = i.moduleSpecifier.replace(extensionRemoveRegex, '');
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

    if (moduleSpecifier.startsWith('node:') && allowedModuleNames.has('@types/node')) {
      continue;
    }

    if (
      allowedModuleNames.has(moduleSpecifier.match(moduleSpeciferMatcher)?.[0] || moduleSpecifier)
    ) {
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
