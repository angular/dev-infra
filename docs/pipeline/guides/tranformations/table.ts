/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RendererApi} from 'marked';

export const tableRender: RendererApi['table'] = ({header, raw, rows}) => {
  return `
  <div class="docs-table docs-scroll-track-transparent">
    <table>
      <thead>
        ${tablerow({
          text: header.map((cell) => tablecell(cell)).join(''),
        })}
      </thead>
      <tbody>
        ${rows
          .map((row) =>
            tablerow({
              text: row.map((cell) => tablecell(cell)).join(''),
            }),
          )
          .join('')}
      </tbody>
    </table>
  </div>
  `;
};

const tablerow: RendererApi['tablerow'] = ({text}) => {
  return `<tr>${text}</tr>`;
};

const tablecell: RendererApi['tablecell'] = ({header, text}) => {
  const type = header ? 'th' : 'td';
  return `<${type}>${text}</${type}>`;
};
