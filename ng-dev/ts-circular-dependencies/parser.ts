/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

/**
 * Finds all module references in the specified source file.
 * @param node Source file which should be parsed.
 * @returns List of import specifiers in the source file.
 */
export function getModuleReferences(initialNode: ts.SourceFile): string[] {
  const references: string[] = [];
  const visitNode = (n: ts.Node) => {
    if (
      (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) &&
      n.moduleSpecifier !== undefined &&
      ts.isStringLiteral(n.moduleSpecifier)
    ) {
      references.push(n.moduleSpecifier.text);
    }
    ts.forEachChild(n, visitNode);
  };

  ts.forEachChild(initialNode, visitNode);

  return references;
}
