/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InterfaceEntry} from '../entities';
import {InterfaceEntryRenderable} from '../entities/renderables';
import {addRenderableCodeToc} from './code-transforms';
import {
  addHtmlAdditionalLinks,
  addHtmlUsageNotes,
  addHtmlJsDocTagComments,
  addHtmlDescription,
} from './jsdoc-transforms';
import {addRenderableGroupMembers} from './member-transforms';
import {addModuleName} from './module-name';

/** Given an unprocessed interface entry, get the fully renderable interface entry. */
export function getInterfaceRenderable(
  entry: InterfaceEntry,
  moduleName: string,
): InterfaceEntryRenderable {
  return addRenderableCodeToc(
    addRenderableGroupMembers(
      addHtmlAdditionalLinks(
        addHtmlUsageNotes(
          addHtmlJsDocTagComments(addHtmlDescription(addModuleName(entry, moduleName))),
        ),
      ),
    ),
  );
}
