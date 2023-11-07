/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h, Fragment} from 'preact';
import {CliCommandRenderable} from '../entities/renderables';
import {HeaderCli} from './header-cli';
import {CODE_LINE_CLASS_NAME, REFERENCE_MEMBERS, REFERENCE_MEMBERS_CONTAINER} from '../constants/html-classes';
import {RawHtml} from './raw-html';
import {CliCard} from './cli-card';

/** Component to render a CLI command reference document. */
export function CliCommandReference(entry: CliCommandRenderable) {
  return (
    <div className="cli">
      <div className="adev-reference-cli-content">
        <HeaderCli command={entry} />
        <div class="docs-code adev-reference-cli-toc">
          <pre class="adev-mini-scroll-track">
            <code>
              <div className={CODE_LINE_CLASS_NAME}>
                ng {entry.name}
                {entry.argumentsLabel ? <button member-id={'Arguments'} className="hljs-ln-line-argument">{entry.argumentsLabel}</button> : <></>}
                {entry.hasOptions ? <button member-id={'Options'} className="hljs-ln-line-option">[options]</button> : <></>}
              </div>
            </code>
          </pre>
        </div>
        <RawHtml value={entry.htmlDescription}/>
      </div>
      <div className={REFERENCE_MEMBERS_CONTAINER}>
        <div className={REFERENCE_MEMBERS}>
          {entry.cards.map((card) => <CliCard card={card} />)}
        </div>
      </div>
    </div>
  );
}
