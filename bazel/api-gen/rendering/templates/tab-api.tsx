/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {DocEntryRenderable} from '../entities/renderables';
import {API_TAB_NAME} from '../constants/tab-names';
import {CodeTableOfContents} from './code-table-of-contents';
import {API_TAB_CONTAINER_CLASS_NAME} from '../constants/html-classes';
import {HasRenderableToc} from '../entities/traits';
import {normalizeTabUrl} from '../helpers/url';


/** Component to render the API tab. */
export function TabApi(props: {entry: DocEntryRenderable & HasRenderableToc}) {
  return (
    <div data-tab={API_TAB_NAME} data-tab-url={normalizeTabUrl(API_TAB_NAME)}>
      <div class={API_TAB_CONTAINER_CLASS_NAME}>
        <CodeTableOfContents codeLinesGroups={props.entry.codeLinesGroups} />
      </div>
    </div>
  );
}
