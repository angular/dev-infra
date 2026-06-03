/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullApproveGroupArray, PullApproveStringArray} from './pullapprove_arrays.js';

import {PullApproveAuthorStateDependencyError} from './condition_errors.js';
import {PullApproveGroup} from './group.js';
import {getOrCreateGlob} from './utils.js';
import ts from 'typescript';

/**
 * Context object that will be used as global context in condition evaluation.
 *
 * Conditions can use various helpers that PullApprove provides. We try to
 * mock them here. Consult the official docs for more details:
 * https://docs.pullapprove.com/config/conditions.
 */
const conditionEvaluationContext: object = (() => {
  const context = {
    'len': (value: any[]) => value.length,
    'contains_any_globs': (files: PullApproveStringArray, patterns: string[]) => {
      // Note: Do not always create globs for the same pattern again. This method
      // could be called for each source file. Creating glob's is expensive.
      return files.some((f) => patterns.some((pattern) => getOrCreateGlob(pattern).match(f)));
    },
  };

  // We cannot process references to `author` in conditions.
  Object.defineProperty(context, 'author', {
    get: () => {
      const x: any = new String();
      x.matchesAny = true;
      return x;
    },
  });

  return context;
})();

/**
 * Converts a given condition to a function that accepts a set of files. The returned
 * function can be called to check if the set of files matches the condition.
 */
export function convertConditionToFunction(
  expr: string,
): (files: string[], groups: PullApproveGroup[]) => boolean {
  const jsExpressionStr = transformExpressionToJs(expr);

  const sourceFile = ts.createSourceFile(
    'expr.ts',
    jsExpressionStr,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  return (files, groups) => {
    const evaluationContext = Object.create(conditionEvaluationContext);
    evaluationContext['files'] = new PullApproveStringArray(...files);
    evaluationContext['groups'] = new PullApproveGroupArray(...groups);

    const result = evaluateNode(sourceFile, evaluationContext);

    // If an array is returned, we consider the condition as active if the array is not
    // empty. This matches PullApprove's condition evaluation that is based on Python.
    if (Array.isArray(result)) {
      return result.length !== 0;
    }
    return !!result;
  };
}

function evaluateNode(node: ts.Node, context: any): any {
  if (ts.isSourceFile(node)) {
    if (node.statements.length !== 1) {
      throw new Error('Invalid expression: multiple statements not allowed');
    }
    const stmt = node.statements[0];
    if (!ts.isExpressionStatement(stmt)) {
      throw new Error('Invalid expression: must be an expression');
    }
    return evaluateNode(stmt.expression, context);
  }

  if (ts.isExpressionStatement(node)) {
    return evaluateNode(node.expression, context);
  }

  if (ts.isParenthesizedExpression(node)) {
    return evaluateNode(node.expression, context);
  }

  if (ts.isPrefixUnaryExpression(node)) {
    if (node.operator === ts.SyntaxKind.ExclamationToken) {
      return !evaluateNode(node.operand, context);
    }
    throw new Error(`Unsupported prefix operator: ${node.operator}`);
  }

  if (ts.isBinaryExpression(node)) {
    const left = evaluateNode(node.left, context);

    if (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      return left && evaluateNode(node.right, context);
    }
    if (node.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
      return left || evaluateNode(node.right, context);
    }

    const right = evaluateNode(node.right, context);
    switch (node.operatorToken.kind) {
      case ts.SyntaxKind.EqualsEqualsToken:
      case ts.SyntaxKind.EqualsEqualsEqualsToken:
        return left === right;
      case ts.SyntaxKind.ExclamationEqualsToken:
      case ts.SyntaxKind.ExclamationEqualsEqualsToken:
        return left !== right;
      case ts.SyntaxKind.GreaterThanToken:
        return left > right;
      case ts.SyntaxKind.GreaterThanEqualsToken:
        return left >= right;
      case ts.SyntaxKind.LessThanToken:
        return left < right;
      case ts.SyntaxKind.LessThanEqualsToken:
        return left <= right;
      default:
        throw new Error(`Unsupported binary operator: ${node.operatorToken.kind}`);
    }
  }

  if (ts.isIdentifier(node)) {
    const name = node.text;
    if (name in context) {
      return context[name];
    }
    throw new Error(`Undefined variable or function: ${name}`);
  }

  if (ts.isPropertyAccessExpression(node)) {
    const obj = evaluateNode(node.expression, context);
    const prop = node.name.text;

    if (obj && (typeof obj === 'object' || typeof obj === 'string')) {
      if (Array.isArray(obj)) {
        if (prop === 'length') {
          return obj.length;
        }
        if (prop === 'includes') {
          return obj.includes.bind(obj);
        }
        if (prop === 'some') {
          return obj.some.bind(obj);
        }
        if (prop === 'filter') {
          return obj.filter.bind(obj);
        }
        if (prop === 'include' && typeof (obj as any).include === 'function') {
          return (obj as any).include.bind(obj);
        }
        if (prop === 'exclude' && typeof (obj as any).exclude === 'function') {
          return (obj as any).exclude.bind(obj);
        }
        if (prop === 'names') {
          return (obj as any).names;
        }
        if (prop === 'active') {
          return (obj as any).active;
        }
        if (prop === 'approved') {
          return (obj as any).approved;
        }
        if (prop === 'pending') {
          return (obj as any).pending;
        }
        if (prop === 'inactive') {
          return (obj as any).inactive;
        }
        if (prop === 'rejected') {
          return (obj as any).rejected;
        }
      } else if (obj instanceof String || typeof obj === 'string') {
        if (prop === 'matchesAny') {
          return (obj as any).matchesAny;
        }
      } else if (obj instanceof PullApproveGroup) {
        if (prop === 'groupName') {
          return obj.groupName;
        }
        if (prop === 'precedingGroups') {
          return obj.precedingGroups;
        }
      }
    }
    throw new Error(`Forbidden property access: ${prop}`);
  }

  if (ts.isCallExpression(node)) {
    const fn = evaluateNode(node.expression, context);
    if (typeof fn !== 'function') {
      throw new Error(`Expression is not a function`);
    }

    const args: any[] = [];
    for (const arg of node.arguments) {
      if (ts.isArrowFunction(arg)) {
        args.push(createCallback(arg, context));
      } else {
        args.push(evaluateNode(arg, context));
      }
    }

    return fn(...args);
  }

  if (ts.isStringLiteral(node)) {
    return node.text;
  }

  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }

  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((el) => evaluateNode(el, context));
  }

  throw new Error(`Unsupported expression node type: ${ts.SyntaxKind[node.kind]}`);
}
function createCallback(arrowFn: ts.ArrowFunction, context: any): Function {
  if (arrowFn.parameters.length !== 1) {
    throw new Error('Only arrow functions with exactly 1 parameter are supported');
  }
  const paramName = (arrowFn.parameters[0].name as ts.Identifier).text;

  return (val: any) => {
    const childContext = Object.create(context);
    childContext[paramName] = val;

    return evaluateNode(arrowFn.body, childContext);
  };
}

/**
 * Transforms a condition expression from PullApprove that is based on python
 * so that it can be run inside JavaScript. Current transformations:
 *
 *   1. `aExpr not in bExpr` --> `!bExpr.includes(aExpr)`
 *   2. `aExpr in bExpr`     --> `bExpr.includes(aExpr`)
 *   3. `not expr`           --> `!expr`
 */
function transformExpressionToJs(expression: string): string {
  return expression
    .replace(/^(.+)\s+not in\s+(\[.+\])$/, '!$2.includes($1)')
    .replace(/^(.+)\s+in\s+(.+)$/, '$2.some(x => $1.matchesAny || $1 == x)')
    .replace(/^(.+)\s+not in\s+(.+)$/, '!$2.includes($1)')
    .replace(/^(.+)\s+in\s+(.+)$/, '$2.includes($1)')
    .replace(/not\s+/g, '!');
}
