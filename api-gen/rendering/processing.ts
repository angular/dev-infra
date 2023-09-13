import {isClassEntry} from './entities/categorization';
import {DocEntry} from './entities';
import {DocEntryRenderable} from './entities/renderables';
import {getClassRenderable} from './transforms/class-transforms';
import {addHtmlDescription, addHtmlJsDocTagComments} from './transforms/jsdoc-transforms';

/** Given a doc entry, get the transformed version of the entry for rendering. */
export function processEntryForRender(entry: DocEntry): DocEntryRenderable {
  if (isClassEntry(entry)) {
    return getClassRenderable(entry);
  }

  // Fall back to adding an `htmlDescription` and transformed JsDoc tags.
  return addHtmlJsDocTagComments(addHtmlDescription(entry));
}
