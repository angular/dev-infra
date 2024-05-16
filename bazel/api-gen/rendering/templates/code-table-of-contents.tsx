/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {CodeLineRenderable} from '../entities/renderables';
import {CodeLineGroup} from './code-line-group';

export function CodeTableOfContents(props: {codeLinesGroups: Map<string, CodeLineRenderable[]>}) {
  return (
    <div class="docs-code">
      <pre class="docs-mini-scroll-track">
        <code>
          {Array.from(props.codeLinesGroups).map(([_, group]) => (
            <CodeLineGroup lines={group} />
          ))}
        </code>
      </pre>
    </div>
  );
}
