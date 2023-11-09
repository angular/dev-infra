/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {hooks} from './hooks';
import {readFile} from 'fs/promises';
import {renderer} from './renderer';
import {docsAlertExtension} from './extensions/docs-alert';
import {docsCalloutExtension} from './extensions/docs-callout';

export async function parseMarkdown(filepath: string): Promise<string> {
  marked.use({
    hooks,
    renderer,
    extensions: [docsAlertExtension, docsCalloutExtension],
    // The async option causes marked to await walkTokens functions before parsing the tokens and returning an HTML string.
    // We leverage this to allow us to use async libraries like mermaid and building stackblitz examples.
    async: true,
  });

  const markdownContent = await readFile(filepath, {encoding: 'utf-8'});
  return marked.parse(markdownContent);
}
