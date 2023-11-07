/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h, Fragment} from 'preact';
import {FunctionEntryRenderable, MethodEntryRenderable, ParameterEntryRenderable} from '../entities/renderables';
import {Parameter} from './parameter';
import {RawHtml} from './raw-html';
import {PARAM_KEYWORD_CLASS_NAME, RETURN_TYPE_CLASS_NAME, REFERENCE_MEMBER_CARD_ITEM, REFERENCE_MEMBER_CARD_ITEM_DEPRECATED, REFERENCE_FUNCTION_DEFINITION} from '../constants/html-classes';
import {DeprecatedLabel} from './deprecated-label';

/**
 * Component to render the method-specific parts of a class's API reference.
 */
export function ClassMethodInfo(props: { entry: MethodEntryRenderable | FunctionEntryRenderable, isOverloaded?: boolean }) {
  const entry = props.entry;

  return (
      <div className={`${REFERENCE_MEMBER_CARD_ITEM} ${entry.isDeprecated ? REFERENCE_MEMBER_CARD_ITEM_DEPRECATED : ''}`}>
        <RawHtml value={entry.htmlDescription} className={REFERENCE_FUNCTION_DEFINITION} />
        {/* In case when method is overloaded we need to indicate which overload is deprecated */}
        {!props.isOverloaded ? <></> : <DeprecatedLabel entry={entry}/>}
        {entry.params.map((param: ParameterEntryRenderable) => <Parameter param={param}/>)}
        <div className={RETURN_TYPE_CLASS_NAME}>
          <span className={PARAM_KEYWORD_CLASS_NAME}>@returns</span>
          <code>{entry.returnType}</code>
        </div>
      </div>
  );
}
