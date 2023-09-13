import {ClassEntry} from '../entities';
import {ClassEntryRenderable} from '../entities/renderables';
import {addHtmlDescription, addHtmlJsDocTagComments} from './jsdoc-transforms';
import {addRenderableMembers} from './member-transforms';

/** Given an unprocessed class entry, get the fully renderable class entry. */
export function getClassRenderable(classEntry: ClassEntry): ClassEntryRenderable {
  return addRenderableMembers(addHtmlJsDocTagComments(addHtmlDescription(classEntry)));
}
