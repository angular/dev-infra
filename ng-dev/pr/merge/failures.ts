/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Error class that indicates a fatal merge tool error that cannot be ignored. */
export class FatalMergeToolError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/** Error class that can be thrown the user aborted the merge manually. */
export class UserAbortedMergeToolError extends Error {}
