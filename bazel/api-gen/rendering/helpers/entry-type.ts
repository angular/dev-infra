/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EntryType} from '../entities';

export function getEntryTypeDisplayName(entryType: EntryType | string): string {
  switch (entryType) {
    case EntryType.NgModule:
      return 'NgModule';
    case EntryType.TypeAlias:
      return 'Type Alias';
    case EntryType.UndecoratedClass:
      return 'Class';
  }
  return entryType;
}
