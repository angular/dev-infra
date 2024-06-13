/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import highlightJs, {HighlightResult} from 'highlight.js';
import {Renderer as MarkedRenderer, Tokens} from 'marked';
import {AIO_URL} from '../backwards-compatibility/domains';
import {splitLines} from '../transforms/code-transforms';

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export const renderer: Partial<MarkedRenderer> = {
  code({text, lang, escaped}): string {
    let highlightResult: HighlightResult;
    // Use try catch because there are existing content issues when there is provided nonexistent
    // language, like `typescript=` etc. In that case when there will be an error thrown `Could not
    // find the language 'typescript=', did you forget to load/include a language module?`
    // Let's try to use `highlightAuto`.
    try {
      highlightResult = lang
        ? highlightJs.highlight(text, {language: lang})
        : highlightJs.highlightAuto(text);
    } catch {
      highlightResult = highlightJs.highlightAuto(text);
    }

    const lines = splitLines(highlightResult.value);

    return `
      <div class="docs-code" role="group">
        <pre class="docs-mini-scroll-track">
          <code>
            ${lines.map((line) => `<span class="hljs-ln-line">${line}</span>`).join('')}
          </code>
        </pre>
      </div>
    `;
  },
  image({href, title, text}): string {
    return `
    <img src="${href}" alt="${text}" title="${title}" class="docs-image">
    `;
  },
  link({href, title}): string {
    title = title?.startsWith(AIO_URL) ? 'our guides' : title;
    return `<a href="${href}">${title}</a>`;
  },
  list({raw: body, ordered}: Tokens.List) {
    if (ordered) {
      return `
      <ol class="docs-ordered-list">
        ${body}
      </ol>
      `;
    }
    return `
    <ul class="docs-list">
      ${body}
    </ul>
    `;
  },
  table({header, raw: body}): string {
    return `
      <div class="docs-table docs-scroll-track-transparent">
        <table>
          <thead>
            ${header}
          </thead>
          <tbody>
            ${body}
          </tbody>
        </table>
      </div>
    `;
  },
};
