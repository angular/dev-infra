/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from './entities';
import {CliCommand} from './cli-entities';
import {
  isClassEntry,
  isConstantEntry,
  isEnumEntry,
  isInterfaceEntry,
  isFunctionEntry,
  isTypeAliasEntry,
} from './entities/categorization';
import {CliCommandRenderable, DocEntryRenderable} from './entities/renderables';
import {getClassRenderable} from './transforms/class-transforms';
import {getConstantRenderable} from './transforms/constant-transforms';
import {getEnumRenderable} from './transforms/enum-transforms';
import {getInterfaceRenderable} from './transforms/interface-transforms';
import {getFunctionRenderable} from './transforms/function-transforms';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
} from './transforms/jsdoc-transforms';
import {addModuleName} from './transforms/module-name';
import {getCliRenderable} from './transforms/cli-transforms';
import {getTypeAliasRenderable} from './transforms/type-alias-transforms';

export function getRenderable(entry: DocEntry, moduleName: string): DocEntryRenderable {
  if (isClassEntry(entry)) {
    return getClassRenderable(entry, moduleName);
  }
  if (isConstantEntry(entry)) {
    return getConstantRenderable(entry, moduleName);
  }
  if (isEnumEntry(entry)) {
    return getEnumRenderable(entry, moduleName);
  }
  if (isInterfaceEntry(entry)) {
    return getInterfaceRenderable(entry, moduleName);
  }
  if (isFunctionEntry(entry)) {
    return getFunctionRenderable(entry, moduleName);
  }
  if (isTypeAliasEntry(entry)) {
    return getTypeAliasRenderable(entry, moduleName);
  }

  // Fallback to an uncategorized renderable.
  return addHtmlAdditionalLinks(
    addHtmlDescription(
      addHtmlUsageNotes(addHtmlJsDocTagComments(addModuleName(entry, moduleName))),
    ),
  );
}

export function getRenderableCommand(command: CliCommand): CliCommandRenderable {
  return getCliRenderable(command);
}
