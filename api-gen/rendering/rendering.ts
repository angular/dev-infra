import nunjucks from 'nunjucks';
import {DOC_ENTRY_TEMPLATES} from './entities/entry_template_map';
import {NunjucksRunfilesLoader} from './nunjucks_loader';
import {DocEntryRenderable} from './entities/renderables';

/** Configure a nunjucks environment with our custom loader. */
const nunjucksEnvironment = new nunjucks.Environment(new NunjucksRunfilesLoader());

/** Renders a processed entry to an HTML string. */
export function renderEntry(entry: DocEntryRenderable): string {
  const template = DOC_ENTRY_TEMPLATES.get(entry.entryType);

  if (!template) {
    throw new Error(`No template for entry type "${entry.entryType}"`);
  }

  // Unfortunately at this point we lose all of our beautiful type safety.
  return nunjucksEnvironment.render(template, entry);
}
