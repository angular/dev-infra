/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Default locale used in the tool for string comparisons and locale-specific output. */
export const defaultLocale = 'en-US';

/**
 * Compares a given string to another one, returning a number indicating
 * whether `a` should be positioned before `b` or the other way around.
 */
export function compareString(a: string, b: string): number {
  return a.localeCompare(b, defaultLocale);
}
