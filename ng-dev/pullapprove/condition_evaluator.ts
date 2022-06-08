/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullApproveGroupArray, PullApproveStringArray} from './pullapprove_arrays.js';

import {PullApproveAuthorStateDependencyError} from './condition_errors.js';
import {PullApproveGroup} from './group.js';
import {getOrCreateGlob} from './utils.js';
import {runInNewContext} from 'vm';

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
      throw new PullApproveAuthorStateDependencyError();
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
  const jsExpression = `
    (files, groups) => {
      return (${transformExpressionToJs(expr)});
    }
  `;
  const isMatchingFn = runInNewContext(jsExpression, conditionEvaluationContext);

  return (files, groups) => {
    const result = isMatchingFn(
      new PullApproveStringArray(...files),
      new PullApproveGroupArray(...groups),
    );

    // If an array is returned, we consider the condition as active if the array is not
    // empty. This matches PullApprove's condition evaluation that is based on Python.
    if (Array.isArray(result)) {
      return result.length !== 0;
    }
    return !!result;
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
    .replace(/^(.+)\s+not in\s+(.+)$/, '!$2.includes($1)')
    .replace(/^(.+)\s+in\s+(.+)$/, '$2.includes($1)')
    .replace(/not\s+/g, '!');
}
