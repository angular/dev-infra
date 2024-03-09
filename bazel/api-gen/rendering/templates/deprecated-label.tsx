/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {PARAM_KEYWORD_CLASS_NAME} from '../styling/css-classes';

export function DeprecatedLabel(props: {entry: {isDeprecated: boolean}}) {
  const entry = props.entry;

  if (entry.isDeprecated) {
    return (<span className={`${PARAM_KEYWORD_CLASS_NAME} docs-deprecated`}>@deprecated</span>);
  }

  return (<></>);
}
