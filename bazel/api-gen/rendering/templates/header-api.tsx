/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {h} from 'preact';
import {EntryType} from '../entities';
import {DocEntryRenderable} from '../entities/renderables';
import {
  HEADER_CLASS_NAME,
  HEADER_ENTRY_CATEGORY,
  HEADER_ENTRY_LABEL,
  HEADER_ENTRY_TITLE,
} from '../styling/css-classes';
import {DocsPillRow} from './docs-pill-row';

/** Component to render a header of the API page. */
export function HeaderApi(props: {entry: DocEntryRenderable; showFullDescription?: boolean}) {
  const entry = props.entry;

  return (
    <header className={HEADER_CLASS_NAME}>
      <span className={HEADER_ENTRY_CATEGORY}>{entry.moduleName}</span>

      <div className={HEADER_ENTRY_TITLE}>
        <div>
          <h1>{entry.name}</h1>
          <div
            className={HEADER_ENTRY_LABEL}
            data-mode={'full'}
            data-type={entry.entryType.toLowerCase()}
          >
            {getEntryTypeDisplayName(entry.entryType)}
          </div>
          {entry.isDeprecated && (
            <div className={HEADER_ENTRY_LABEL} data-mode={'full'} data-type="deprecated">
              Deprecated
            </div>
          )}
          {entry.isDeveloperPreview && (
            <div className={HEADER_ENTRY_LABEL} data-mode={'full'} data-type="developer_preview">
              Developer preview
            </div>
          )}
          {entry.isExperimental && (
            <div className={HEADER_ENTRY_LABEL} data-mode={'full'} data-type="experimental">
              Experimental
            </div>
          )}
        </div>
      </div>

      <p
        className={'docs-reference-description'}
        dangerouslySetInnerHTML={{
          __html: props.showFullDescription ? entry.htmlDescription : entry.shortHtmlDescription,
        }}
      ></p>

      <DocsPillRow links={entry.additionalLinks} />
    </header>
  );
}

function getEntryTypeDisplayName(entryType: EntryType | string): string {
  switch (entryType) {
    case EntryType.NgModule:
      return 'NgModule';
    case EntryType.TypeAlias:
      return 'Type Alias';
    case EntryType.UndecoratedClass:
      return 'Class';
    case EntryType.InitializerApiFunction:
      return 'Initializer API';
  }
  return entryType;
}
