/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HasJsDocTags} from '../entities/traits';

export function isDeprecatedEntry<T extends HasJsDocTags>(entry: T) {
  return entry.jsdocTags.some((tag) => tag.name === 'deprecated');
}
