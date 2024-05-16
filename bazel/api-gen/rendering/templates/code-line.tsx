/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {CodeLineRenderable} from '../entities/renderables';

export function CodeLine(props: {line: CodeLineRenderable}) {
  const line = props.line;
  const className = `hljs-ln-line ${line.isDeprecated ? `hljs-ln-line-deprecated` : ''}`;

  if (line.id) {
    return (<button aria-describedby="jump-msg" type="button" className={className} member-id={line.id} dangerouslySetInnerHTML={({__html: line.contents})}></button>);
  } else {
    return (<div class={className} dangerouslySetInnerHTML={({__html: line.contents})}></div>);
  }
}
