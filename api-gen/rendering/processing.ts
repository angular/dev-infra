import {DocEntry} from './entities';
import {isClassEntry} from './entities/categorization';
import {DocEntryRenderable} from './entities/renderables';
import {getClassRenderable} from './transforms/class-transforms';
import {addHtmlDescription, addHtmlJsDocTagComments} from './transforms/jsdoc-transforms';
import {addModuleName} from './transforms/module-name';

export function getRenderable(entry: DocEntry, moduleName: string): DocEntryRenderable {
  if (isClassEntry(entry)) {
    return getClassRenderable(entry, moduleName);
  }

  // Fallback to an uncategorized renderable.
  return addHtmlDescription(addHtmlJsDocTagComments(addModuleName(entry, moduleName)));
}
