import {render} from 'preact-render-to-string';
import {DocEntry} from './entities';
import {isClassEntry} from './entities/categorization';
import {ClassReference} from './templates/class-reference';
import {getClassRenderable} from './transforms/class-transforms';

/** Given a doc entry, get the transformed version of the entry for rendering. */
export function transformAndRenderEntry(entry: DocEntry): string {
  if (isClassEntry(entry)) {
    const renderable = getClassRenderable(entry);
    return render(ClassReference(renderable));
  }

  // Fall back rendering nothing while in development.
  return '';
}
