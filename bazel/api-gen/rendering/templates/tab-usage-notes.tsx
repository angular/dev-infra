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
import {USAGE_NOTES_TAB_NAME} from '../constants/tab-names';
import {normalizeTabUrl} from '../helpers/url';

/** Component to render the usage notes tab. */
export function TabUsageNotes(props: {entry: DocEntryRenderable}) {
  if (!props.entry.htmlUsageNotes) {
    return (<></>);
  }

  return (
    <div data-tab={USAGE_NOTES_TAB_NAME} data-tab-url={normalizeTabUrl(USAGE_NOTES_TAB_NAME)}>
      <RawHtml value={props.entry.htmlUsageNotes} />
    </div>
  );
}
