/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {DocEntryRenderable} from '../entities/renderables';
import {RawHtml} from './raw-html';
import {DESCRIPTION_TAB_NAME} from '../constants/tab-names';
import {normalizeTabUrl} from '../helpers/url';


/** Component to render the description tab. */
export function TabDescription(props: {entry: DocEntryRenderable}) {
  if (!props.entry.htmlDescription || props.entry.htmlDescription === props.entry.shortHtmlDescription) {
    return (<></>);
  }

  return (
    <div data-tab={DESCRIPTION_TAB_NAME} data-tab-url={normalizeTabUrl(DESCRIPTION_TAB_NAME)}>
      <RawHtml value={props.entry.htmlDescription} />
    </div>
  );
}
