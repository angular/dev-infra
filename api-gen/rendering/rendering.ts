import {render} from 'preact-render-to-string';
import {isClassEntry} from './entities/categorization';
import {DocEntryRenderable} from './entities/renderables';
import {ClassReference} from './templates/class-reference';

/** Given a doc entry, get the transformed version of the entry for rendering. */
export function renderEntry(renderable: DocEntryRenderable): string {
  if (isClassEntry(renderable)) {
    return render(ClassReference(renderable));
  }

  // Fall back rendering nothing while in development.
  return '';
}
