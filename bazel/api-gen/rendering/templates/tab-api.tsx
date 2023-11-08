/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {API_TAB_NAME} from '../constants/tab-names';
import {DocEntryRenderable} from '../entities/renderables';
import {HasRenderableToc} from '../entities/traits';
import {normalizeTabUrl} from '../helpers/url';
import {CodeTableOfContents} from './code-table-of-contents';


/** Component to render the API tab. */
export function TabApi(props: {entry: DocEntryRenderable & HasRenderableToc}) {
  return (
    <div data-tab={API_TAB_NAME} data-tab-url={normalizeTabUrl(API_TAB_NAME)}>
      <div class={'adev-reference-api-tab'}>
        <CodeTableOfContents codeLinesGroups={props.entry.codeLinesGroups} />
      </div>
    </div>
  );
}
