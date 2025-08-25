/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import fs from 'node:fs';

export interface Import {
  diagnosticNode: ts.Node;
  moduleSpecifier: string;
}

export function getImportsInSourceFile(fileExecPath: string): Import[] {
  const content = fs.readFileSync(fileExecPath, 'utf8');
  const sf = ts.createSourceFile(fileExecPath, content, ts.ScriptTarget.ESNext, true);
  const result: Import[] = [];

  const visitor = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const leadingComments = ts.getLeadingCommentRanges(content, node.pos) || [];
      for (const comment of leadingComments) {
        const commentText = content.substring(comment.pos, comment.end);
        if (/@ts-ignore.*strict-deps/.test(commentText)) {
          return;
        }
      }

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
