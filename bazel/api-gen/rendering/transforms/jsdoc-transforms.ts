/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {JsDocTagEntry} from '../entities';

import {
  getDeprecatedEntry,
  isDeprecatedEntry,
  isDeveloperPreview,
} from '../entities/categorization';
import {LinkEntryRenderable} from '../entities/renderables';
import {
  HasAdditionalLinks,
  HasDeprecatedFlag,
  HasDescription,
  HasDeveloperPreviewFlag,
  HasHtmlDescription,
  HasHtmlUsageNotes,
  HasJsDocTags,
  HasModuleName,
  HasRenderableJsDocTags,
} from '../entities/traits';

import {getLinkToModule} from './url-transforms';

export const JS_DOC_USAGE_NOTES_TAG = 'usageNotes';
export const JS_DOC_SEE_TAG = 'see';
export const JS_DOC_DESCRIPTION_TAG = 'description';

/** Given an entity with a description, gets the entity augmented with an `htmlDescription`. */
export function addHtmlDescription<T extends HasDescription>(entry: T): T & HasHtmlDescription {
  const firstParagraphRule = /(.*?)(?:\n\n|$)/s;

  let jsDocDescription = '';

  if ('jsdocTags' in entry) {
    jsDocDescription =
      (entry.jsdocTags as JsDocTagEntry[]).find((tag) => tag.name === JS_DOC_DESCRIPTION_TAG)
        ?.comment ?? '';
  }

  const description = !!entry.description ? entry.description : jsDocDescription;
  const shortTextMatch = description.match(firstParagraphRule);
  const htmlDescription = getHtmlForJsDocText(description).trim();
  const shortHtmlDescription = getHtmlForJsDocText(shortTextMatch ? shortTextMatch[0] : '').trim();
  return {
    ...entry,
    htmlDescription,
    shortHtmlDescription,
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

/** Given an entity with `See also` links. */
export function addHtmlAdditionalLinks<T extends HasJsDocTags & HasModuleName>(
  entry: T,
): T & HasAdditionalLinks {
  return {
    ...entry,
    additionalLinks: getHtmlAdditionalLinks(entry),
  };
}

export function addHtmlUsageNotes<T extends HasJsDocTags>(entry: T): T & HasHtmlUsageNotes {
  const usageNotesTag = entry.jsdocTags.find((tag) => tag.name === JS_DOC_USAGE_NOTES_TAG);
  const htmlUsageNotes = usageNotesTag
    ? (marked.parse(
        convertJsDocExampleToHtmlExample(wrapExampleHtmlElementsWithCode(usageNotesTag.comment)),
      ) as string)
    : '';

  return {
    ...entry,
    htmlUsageNotes,
  };
}

/** Given a markdown JsDoc text, gets the rendered HTML. */
export function getHtmlForJsDocText(text: string): string {
  return marked.parse(wrapExampleHtmlElementsWithCode(text)) as string;
}

export function setEntryFlags<T extends HasJsDocTags>(
  entry: T,
): T & HasDeprecatedFlag & HasDeveloperPreviewFlag {
  const deprecationMessage = getDeprecatedEntry(entry);
  return {
    ...entry,
    isDeprecated: isDeprecatedEntry(entry),
    deprecationMessage: deprecationMessage
      ? getHtmlForJsDocText(deprecationMessage)
      : deprecationMessage,
    isDeveloperPreview: isDeveloperPreview(entry),
  };
}

function getHtmlAdditionalLinks<T extends HasJsDocTags & HasModuleName>(
  entry: T,
): LinkEntryRenderable[] {
  const markdownLinkRule = /\[([^\]]+)\]\(([^)]+)\)/;
  // Some links are written in the following format: {@link Route }
  const apiLinkRule = /\{\s*@link\s+([^}]+)\s*\}/;

  const seeAlsoLinks = entry.jsdocTags
    .filter((tag) => tag.name === JS_DOC_SEE_TAG)
    .map((tag) => tag.comment)
    .map((comment) => {
      const markdownLinkMatch = comment.match(markdownLinkRule);

      if (markdownLinkMatch) {
        return {
          label: markdownLinkMatch[1],
          url: markdownLinkMatch[2],
        };
      }

      const linkMatch = comment.match(apiLinkRule);

      if (linkMatch) {
        const link = linkMatch[1];

        // handling links like {@link Route Some route with description}
        const [symbol, description] = link.split(/\s(.+)/);
        if (entry && description) {
          return {
            label: description.trim(),
            url: `${getLinkToModule(entry.moduleName)}/${symbol}`,
          };
        }

        // handling links like {@link Route}
        return {
          label: linkMatch[1].trim(),
          url: `${getLinkToModule(entry.moduleName)}/${linkMatch[1].trim()}`,
        };
      }

      return undefined;
    })
    .filter((link): link is LinkEntryRenderable => !!link);

  return seeAlsoLinks;
}

/**
 * Some descriptions in the text contain HTML elements like `input` or `img`,
 * we should wrap such elements using `code`.
 * Otherwise DocViewer will try to render those elements.
 */
function wrapExampleHtmlElementsWithCode(text: string) {
  return text
    .replaceAll(`'<input>'`, `<code><input></code>`)
    .replaceAll(`'<img>'`, `<code><img></code>`);
}

function convertJsDocExampleToHtmlExample(text: string): string {
  const codeExampleAtRule = /{@example (\S+) region=(['"])([^'"]+)\2\s*}/g;

  return text.replaceAll(codeExampleAtRule, (_, path, separator, region) => {
    return `<code-example path="${path}" region="${region}" />`;
  });
}
