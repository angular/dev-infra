import {DocEntry} from './entities';
import {DocRenderEntry} from './render-entities';
import {marked} from 'marked';

export function processEntryForRender(entry: DocEntry): DocRenderEntry {
  return {
    ...entry,
    htmlDescription: marked.parse(entry.description),
  };
}
