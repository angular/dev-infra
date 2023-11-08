/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {PARAM_KEYWORD_CLASS_NAME} from '../styling/css-classes';
import {
  FunctionEntryRenderable,
  MemberEntryRenderable,
  MethodEntryRenderable
} from '../entities/renderables';

export function DeprecatedLabel(props: { entry: MethodEntryRenderable | FunctionEntryRenderable | MemberEntryRenderable }) {
  const entry = props.entry;

  if (entry.isDeprecated) {
    return (<span className={`${PARAM_KEYWORD_CLASS_NAME} adev-deprecated`}>@deprecated</span>);
  }

  return (<></>);
}
