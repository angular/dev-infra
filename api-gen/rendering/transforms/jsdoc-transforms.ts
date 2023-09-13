import {marked} from 'marked';
import {
  HasDescription,
  HasHtmlDescription,
  HasJsDocTags,
  HasRenderableJsDocTags,
} from '../entities/traits';

/** Given an entity with a description, gets the entity augmented with an `htmlDescription`. */
export function addHtmlDescription<T extends HasDescription>(entry: T): T & HasHtmlDescription {
  return {
    ...entry,
    htmlDescription: getHtmlForJsDocText(entry.description),
  };
}

/**
 * Given an entity with JsDoc tags, gets the entity with JsDocTagRenderable entries that
 * have been augmented with an `htmlComment`.
 */
export function addHtmlJsDocTagComments<T extends HasJsDocTags>(
  entry: T,
): T & HasRenderableJsDocTags {
  return {
    ...entry,
    jsdocTags: entry.jsdocTags.map((tag) => ({
      ...tag,
      htmlComment: getHtmlForJsDocText(tag.comment),
    })),
  };
}

/** Given a markdown JsDoc text, gets the rendered HTML. */
export function getHtmlForJsDocText(text: string): string {
  // TODO: use the fully configured `marked` processors
  return marked.parse(text);
}
