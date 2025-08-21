/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

export interface Import {
  diagnosticNode: ts.Node;
  moduleSpecifier: string;
}

export function getImportsInSourceFile(sf: ts.SourceFile): Import[] {
  const result: Import[] = [];

  const visitor = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;
      // If not moduleSpecifier is included in the declaration, it is infered to be the local file,
      // essentially a self import and can be ignored.
      if (moduleSpecifier) {
        result.push({
          diagnosticNode: moduleSpecifier,
          moduleSpecifier: moduleSpecifier.text,
        });
      }
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length >= 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      result.push({
        diagnosticNode: node,
        moduleSpecifier: node.arguments[0].text,
      });
    }
    ts.forEachChild(node, visitor);
  };

  ts.forEachChild(sf, visitor);

  return result;
}
