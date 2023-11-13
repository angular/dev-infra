/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TokenizerThis, RendererThis} from 'marked';
import {CodeToken} from './format-code';
import {runfiles} from '@bazel/runfiles';
import {readFileSync} from 'fs';
import {FileType, removeEslintComments} from './sanitizers/eslint';

/** Marked token for a custom docs element. */
export interface DocsCodeToken extends CodeToken {
  type: 'docs-code';
  /* Nested code OR the code from the optional file path */
  code: string;
  /* The example file path */
  path: string | undefined;
  /* The example display header */
  header: string | undefined;
  /* Code language */
  language: string | undefined;
  /* Whether stling should include line numbers */
  linenums: boolean | undefined;
  /* The lines to display highlighting on */
  highlight: string | undefined;
  /* The example path to determine diff (lines added/removed) */
  diff: string | undefined;
  /* The lines viewable in collapsed view */
  visibleLines: string | undefined;
  /* The name of the viewable region in the collapsed view */
  visibleRegion: string | undefined;
  /* Whether we should display preview */
  preview: boolean;
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const singleFileSelfClosingCodeRule = /^\s*<docs-code\s([^>]*)((?:.(?!\/>))*)\/>/s;
const singleFileCodeRule = /^\s*<docs-code\s([^>]*)>((?:.(?!\/docs-code))*)<\/docs-code>/s;

const pathRule = /path="([^"]*)"/;
const headerRule = /header="([^"]*)"/;
const linenumsRule = /linenums/;
const highlightRule = /highlight="([^"]*)"/;
const diffRule = /diff="([^"]*)"/;
const languageRule = /language="([^"]*)"/;
const visibleLinesRule = /visibleLines="([^"]*)"/;
const visibleRegionRule = /visibleRegion="([^"]*)"/;
const previewRule = /preview/;

export const docsCodeExtension = {
  name: 'docs-code',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^<docs-code\s/)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsCodeToken | undefined {
    const code = singleFileCodeRule.exec(src);
    const selfClosingCode = singleFileSelfClosingCodeRule.exec(src);
    const match = selfClosingCode ?? code;

    if (match) {
      const attr = match[1].trim();

      const path = pathRule.exec(attr);
      const header = headerRule.exec(attr);
      const linenums = linenumsRule.exec(attr);
      const highlight = highlightRule.exec(attr);
      const diff = diffRule.exec(attr);
      const language = languageRule.exec(attr);
      const visibleLines = visibleLinesRule.exec(attr);
      const visibleRegion = visibleRegionRule.exec(attr);
      const preview = previewRule.exec(attr) ? true : false;

      let code = match[2].trim();
      if (path && path[1]) {
        code = readFileSync(runfiles.resolveWorkspaceRelative(path[1]), {encoding: 'utf-8'});
        const fileType: FileType | undefined = path[1]?.split('.').pop() as FileType;
        code = removeEslintComments(code, fileType);
      }

      const token: DocsCodeToken = {
        type: 'docs-code',
        raw: match[0],
        code: code,
        path: path?.[1],
        header: header?.[1],
        linenums: !!linenums,
        highlight: highlight?.[1],
        diff: diff?.[1],
        language: language?.[1],
        visibleLines: visibleLines?.[1],
        visibleRegion: visibleRegion?.[1],
        preview: preview,
      };
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsCodeToken) {
    // TODO(josephperrott): format the code.
    return `<pre><code>${token.code}</code></pre>`;
  },
};
