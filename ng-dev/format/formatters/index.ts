/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../utils/git/git-client.js';
import {getConfig} from '../../utils/config.js';
import {assertValidFormatConfig} from '../config.js';

import {Buildifier} from './buildifier.js';
import {ClangFormat} from './clang-format.js';
import {Prettier} from './prettier.js';

/**
 * Get all defined formatters which are active based on the current loaded config.
 */
export async function getActiveFormatters() {
  const config = await getConfig();
  assertValidFormatConfig(config);
  const gitClient = await GitClient.get();

  return [
    new Prettier(gitClient, config.format),
    new Buildifier(gitClient, config.format),
    new ClangFormat(gitClient, config.format),
  ].filter((formatter) => formatter.isEnabled());
}

// Rexport symbols used for types elsewhere.
export {Formatter, FormatterAction} from './base-formatter.js';
