/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {render} from 'preact-render-to-string';
import {
  isClassEntry,
  isConstantEntry,
  isEnumEntry,
  isInterfaceEntry,
  isFunctionEntry,
  isTypeAliasEntry,
} from './entities/categorization';
import {CliCommandRenderable, DocEntryRenderable} from './entities/renderables';
import {ClassReference} from './templates/class-reference';
import {ConstantReference} from './templates/constant-reference';
import {EnumReference} from './templates/enum-reference';
import {FunctionReference} from './templates/function-reference';
import {CliCommandReference} from './templates/cli-reference';
import {TypeAliasReference} from './templates/type-alias-reference';
import {DocsReference} from './templates/docs-reference';

/** Given a doc entry, get the transformed version of the entry for rendering. */
export function renderEntry(renderable: DocEntryRenderable): string {
  if (isClassEntry(renderable) || isInterfaceEntry(renderable)) {
    return render(ClassReference(renderable));
  }
  if (isConstantEntry(renderable)) {
    return render(ConstantReference(renderable));
  }
  if (isEnumEntry(renderable)) {
    return render(EnumReference(renderable));
  }
  if (isFunctionEntry(renderable)) {
    return render(FunctionReference(renderable));
  }
  if (isTypeAliasEntry(renderable)) {
    return render(TypeAliasReference(renderable));
  }

  // Fall back rendering nothing while in development.
  return render(DocsReference(renderable));
}

/** Render HTML for CLI based on `CliCommandRenderable` data  */
export function renderCli(renderable: CliCommandRenderable): string {
  return render(CliCommandReference(renderable));
}
