/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import highlightJs from 'highlight.js';
import { h } from 'preact';
import { RawHtml } from './raw-html';

/** Component to render a header of the CLI page. */
export function HighlightTypeScript(props: {code: string}) {
  const result = highlightJs.highlight(props.code, {language: 'typescript'}).value;

  return (
    <RawHtml value={result} />
  );
}
