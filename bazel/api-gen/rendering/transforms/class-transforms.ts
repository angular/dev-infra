import {ClassEntry} from '@angular/compiler-cli';
import {ClassEntryRenderable} from '../entities/renderables';
import {addHtmlDescription, addHtmlJsDocTagComments} from './jsdoc-transforms';
import {addRenderableMembers} from './member-transforms';
import {addModuleName} from './module-name';

/** Given an unprocessed class entry, get the fully renderable class entry. */
export function getClassRenderable(
  classEntry: ClassEntry,
  moduleName: string,
): ClassEntryRenderable {
  return addRenderableMembers(
    addHtmlJsDocTagComments(addHtmlDescription(addModuleName(classEntry, moduleName))),
  );
}
