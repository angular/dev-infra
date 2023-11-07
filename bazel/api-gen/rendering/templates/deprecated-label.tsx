/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h, Fragment} from 'preact';
import {PARAM_KEYWORD_CLASS_NAME, DEPRECATED_CLASS_NAME} from '../constants/html-classes';
import {MethodEntryRenderable, FunctionEntryRenderable, MemberEntryRenderable} from '../entities/renderables';

export function DeprecatedLabel(props: { entry: MethodEntryRenderable | FunctionEntryRenderable | MemberEntryRenderable }) {
  const entry = props.entry;

  if (entry.isDeprecated) {
    return (<span className={`${PARAM_KEYWORD_CLASS_NAME} ${DEPRECATED_CLASS_NAME}`}>@deprecated</span>);
  }

  return (<></>);
}
