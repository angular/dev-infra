/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {hooks} from './hooks.js';
import {renderer} from './renderer.js';
import {docsAlertExtension} from './extensions/docs-alert.js';
import {docsCalloutExtension} from './extensions/docs-callout.js';
import {docsPillExtension} from './extensions/docs-pill/docs-pill.js';
import {docsPillRowExtension} from './extensions/docs-pill/docs-pill-row.js';
import {docsVideoExtension} from './extensions/docs-video.js';
import {docsWorkflowExtension} from './extensions/docs-workflow/docs-workflow.js';
import {docsStepExtension} from './extensions/docs-workflow/docs-step.js';
import {docsCardExtension} from './extensions/docs-card/docs-card.js';
import {docsCardContainerExtension} from './extensions/docs-card/docs-card-container.js';
import {docsDecorativeHeaderExtension} from './extensions/docs-decorative-header.js';
import {docsCodeBlockExtension} from './extensions/docs-code/docs-code-block.js';
import {docsCodeExtension} from './extensions/docs-code/docs-code.js';
import {docsCodeMultifileExtension} from './extensions/docs-code/docs-code-multifile.js';

export async function parseMarkdown(markdownContent: string): Promise<string> {
  marked.use({
    hooks,
    renderer,
    extensions: [
      docsAlertExtension,
      docsCalloutExtension,
      docsPillExtension,
      docsPillRowExtension,
      docsVideoExtension,
      docsWorkflowExtension,
      docsStepExtension,
      docsCardExtension,
      docsCardContainerExtension,
      docsDecorativeHeaderExtension,
      docsCodeBlockExtension,
      docsCodeExtension,
      docsCodeMultifileExtension,
    ],
    // The async option causes marked to await walkTokens functions before parsing the tokens and returning an HTML string.
    // We leverage this to allow us to use async libraries like mermaid and building stackblitz examples.
    async: true,
  });

  return marked.parse(markdownContent);
}
