/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getConfig} from '../../utils/config';
import {assertValidFormatConfig} from '../config';

import {Buildifier} from './buildifier';
import {ClangFormat} from './clang-format';
import {Prettier} from './prettier';

/**
 * Get all defined formatters which are active based on the current loaded config.
 */
export function getActiveFormatters() {
  const config = getConfig();
  assertValidFormatConfig(config);

  return [
    new Prettier(config.format),
    new Buildifier(config.format),
    new ClangFormat(config.format),
  ].filter((formatter) => formatter.isEnabled());
}

// Rexport symbols used for types elsewhere.
export {Formatter, FormatterAction} from './base-formatter';
