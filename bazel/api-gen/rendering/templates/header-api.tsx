/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {h} from 'preact';
import {DocEntryRenderable} from '../entities/renderables';
import {getEntryTypeDisplayName} from '../helpers/entry-type';
import {DocsPillRow} from './docs-pill-row';
import {HEADER_CLASS_NAME, HEADER_ENTRY_CATEGORY, HEADER_ENTRY_DESCRIPTION, HEADER_ENTRY_LABEL, HEADER_ENTRY_TITLE} from '../constants/html-classes';

/** Component to render a header of the API page. */
export function HeaderApi(props: {entry: DocEntryRenderable}) {
  const entry = props.entry;

  return (
    <header className={HEADER_CLASS_NAME}>
      <span className={HEADER_ENTRY_CATEGORY}>{entry.moduleName}</span>

      <div className={HEADER_ENTRY_TITLE}>
        <div>
          <h1>{entry.name}</h1>
          <div className={HEADER_ENTRY_LABEL} data-mode={"full"} data-type={entry.entryType.toLowerCase()}>{getEntryTypeDisplayName(entry.entryType)}</div>
        </div>
      </div>

      <p className={HEADER_ENTRY_DESCRIPTION} dangerouslySetInnerHTML={({__html: entry.shortHtmlDescription})}></p>

      <DocsPillRow links={entry.additionalLinks}/>
    </header>
  );
}
