/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Type narrowing function that becomes true if the given error is of type `T`.
 * The narrowed type will include the NodeJS `ErrnoException` properties.
 */
export function isNodeJSWrappedError<T extends new (...args: any) => Error>(
  value: Error | unknown,
  errorType: T,
): value is InstanceType<T> & NodeJS.ErrnoException {
  return value instanceof errorType;
}
