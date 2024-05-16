/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** The parts that make up a commit message for creating a commit message string. */
export interface CommitMessageParts {
  prefix: string;
  type: string;
  scope: string;
  summary: string;
  body: string;
  footer: string;
}

/**
 * Generate a commit message builder function, using the provided defaults.
 */
export function commitMessageBuilder(defaults: CommitMessageParts) {
  return (params: Partial<CommitMessageParts> = {}) => {
    const {prefix, type, scope, summary, body, footer} = {...defaults, ...params};
    return `${prefix}${type}${scope ? '(' + scope + ')' : ''}: ${summary}\n\n${body}\n\n${footer}`;
  };
}
