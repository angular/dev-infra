/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Commit} from '../../../commit-message/parse.js';

/**
 * Fields from a `Commit` to incorporate when building up an unique
 * id for a commit message.
 *
 * Note: The header incorporates the commit type, scope and message
 * but lacks information for fixup, revert or squash commits..
 */
const fieldsToIncorporateForId: (keyof Commit)[] = ['header', 'isFixup', 'isRevert', 'isSquash'];

/**
 * Computes an unique id for the given commit using its commit message.
 * This can be helpful for comparisons, if commits differ in SHAs due
 * to cherry-picking.
 */
export function computeUniqueIdFromCommitMessage(commit: Commit): string {
  // Join all resolved fields with a special character to build up an id.
  return fieldsToIncorporateForId.map((f) => commit[f]).join('ɵɵ');
}
