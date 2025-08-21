/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

export function createDiagnostic(message: string, node: ts.Node): ts.Diagnostic {
  return {
    category: ts.DiagnosticCategory.Error,
    code: -1,
    file: node.getSourceFile(),
    start: node.getStart(),
    length: node.getWidth(),
    messageText: message,
  };
}
