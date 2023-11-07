/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import hljs from 'highlight.js';
import {join} from 'path';
import {readFileSync} from 'fs';
import {decode} from 'html-entities';
import {regionParser} from '../../regions/region-parser';

const EXAMPLES_FOLDER_PATH = join('projects', 'angular-dev', 'src', 'content', 'api-examples');

/** Marked token for a custom docs element. */
export interface DocsCodeToken extends marked.Tokens.Generic {
  type: 'code-example';
  // The example file path
  path: string | undefined;
  // The name of the viewable region in the collapsed view
  visibleRegion: string | undefined;
  // The body of the `code-example`
  body: string | undefined;
  // The language of the code
  language: string | undefined;
}

const codeExampleSelfClosingCodeRule = /^\s*<code-example\s([^>]*)((?:.(?!\/>))*)\/>/s;
const codeExampleCodeRule =
  /^\s*<code-example\s([^>]*)>((?:.(?!\/code-example))*)<\/code-example>/s;

const languageRule = /language=['"]([^'"]*)['"]/;
const pathRule = /path=['"]([^'"]*)['"]/;
const visibleRegionRule = /region="([^"]*)"/;

const lineMultifileClassName: string = 'hljs-ln-line';

export const codeExampleExtension = {
  name: 'code-example',
  level: 'block',
  start(src: string) {
    return src.match(/^<code-example\s/)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsCodeToken | undefined {
    const code = codeExampleCodeRule.exec(src);
    const selfClosingCode = codeExampleSelfClosingCodeRule.exec(src);
    const match = selfClosingCode ?? code;

    if (match) {
      const attr = match[1].trim();

      const path = pathRule.exec(attr);
      const visibleRegion = visibleRegionRule.exec(attr);
      const language = languageRule.exec(attr);

      const token: DocsCodeToken = {
        type: 'code-example',
        raw: match[0],
        path: path?.[1],
        visibleRegion: visibleRegion?.[1],
        language: language?.[1],
        body: selfClosingCode ? undefined : match[2],
      };
      return token;
    }
    return undefined;
  },
  renderer(this: marked.RendererThis, token: DocsCodeToken) {
    return formatDocsCode(token);
  },
};

function formatDocsCode(token: Partial<DocsCodeToken>): string {
  if (!token.path && !token.body) {
    throw new Error('Undefined path and body in code-example!');
  }
  const code = token.path ? getCodeFromPath(token.path) : token.body!;
  const extractRegionsResult = extractRegions(token, code);
  const language = token.language ?? (token.path ? token.path.split('.')?.pop() : '');
  const highlightedCode = getHighlightedCode(extractRegionsResult.code, language);

  const attributes =
    getAttribute('visibleLines', getRangeValues(extractRegionsResult.visibleLines)?.toString()) +
    getAttribute('path', token.path);

  return `
  <div class="docs-code"${attributes}>
    <pre class="adev-mini-scroll-track">
      <code>${highlightedCode}</code>
    </pre>
  </div>
  `;
}

function appendModifierClassesToCodeLinesElements(htmlString: string): string {
  const lines = getLines(htmlString);
  let finalHtml = '';

  let lineIndex = 0;
  const linesCount = lines.length;

  if (linesCount === 0) {
    return htmlString;
  }

  do {
    finalHtml += `<div class="${lineMultifileClassName}">${lines[lineIndex]}</div>`;
    lineIndex++;
  } while (lineIndex < linesCount);

  return finalHtml;
}

function getLines(text: string): string[] {
  if (text.length === 0) {
    return [];
  }
  return text.split(/\r\n|\r|\n/g);
}

function getCodeFromPath(path: string): string {
  try {
    return readFileSync(join(EXAMPLES_FOLDER_PATH, path), {encoding: 'utf-8'});
  } catch (err) {
    console.error('cannot load file for', join(EXAMPLES_FOLDER_PATH, path));
    return '';
  }
}

function getHighlightedCode(code: string, language?: string): string {
  // Decode the code content to replace HTML entities to characters
  const decodedCode = decode(code);
  return appendModifierClassesToCodeLinesElements(
    language
      ? hljs.highlight(decodedCode, {language}).value
      : hljs.highlightAuto(decodedCode).value,
  );
}

function extractRegions(
  token: Partial<DocsCodeToken>,
  code: string,
): {code: string; visibleLines?: string} {
  if (!token.path) return {code};

  const result = regionParser(code, token.path);

  if (token.visibleRegion) {
    const region = result.regionMap[token.visibleRegion];

    if (!region) return {code};

    return {
      code: result.contents,
      visibleLines: `[${region.ranges.map(
        (range) => `[${range.from}, ${range.to ?? result.totalLinesCount + 1}]`,
      )}]`,
    };
  }

  return {
    code: result.contents,
  };
}

function getAttribute(name: string, value: boolean | number | string | undefined): string {
  return value ? ` ${name}="${value}"` : '';
}

/**
 * The function used to generate ranges of highlighted or visible lines in code blocks
 */
function getRangeValues(token?: string): number[] | null {
  const getAllValuesFromRange = (range: any[]) => {
    const [start, end] = range;
    for (let i = start; i <= end; i++) {
      result.push(i - 1);
    }
  };

  if (!token) {
    return null;
  }

  let result: number[] = [];

  // TODO(jelbourn): specify an actual type for this parse operation.
  const boundaryValueArray = JSON.parse(token) as any;
  if (!Array.isArray(boundaryValueArray)) {
    throw new Error(`Provided token has wrong format!\n${token}`);
  }
  // Flat Array
  if (
    boundaryValueArray.length === 2 &&
    !Array.isArray(boundaryValueArray[0]) &&
    !Array.isArray(boundaryValueArray[1])
  ) {
    getAllValuesFromRange(boundaryValueArray);
  } else {
    for (const range of boundaryValueArray) {
      if (Array.isArray(range) && range.length === 2) {
        getAllValuesFromRange(range);
      } else if (!Number.isNaN(range)) {
        result.push(Number(range - 1));
      } else {
        throw new Error(`Input has wrong format!\n${range}`);
      }
    }
  }

  return result;
}
