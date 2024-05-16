/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RendererApi} from 'marked';

import {getHeaderId} from '../state';
import {getPageTitle} from '../utils';

export const headingRender: RendererApi['heading'] = (text, level, raw) => {
  if (level === 1) {
    return `
    <header class="docs-header">
      <docs-breadcrumb></docs-breadcrumb>

      ${getPageTitle(text)}
    </header>
    `;
  }

  // Nested anchor elements are invalid in HTML
  // They might happen when we have a code block in a heading
  // regex aren't perfect for that but this one should be "good enough"
  const regex = /<a\s+(?:[^>]*?\s+)?href.*?>(.*?)<\/a>/gi;
  const anchorLessText = text.replace(regex, '$1');

  const link = getHeaderId(anchorLessText);
  const label = anchorLessText.replaceAll(/`(.*?)`/g, '<code>$1</code>');

  return `
  <h${level} id="${link}">
    <a href="#${link}" class="docs-anchor" tabindex="-1" aria-label="Link to ${label}">${label}</a>
  </h${level}>
  `;
};
