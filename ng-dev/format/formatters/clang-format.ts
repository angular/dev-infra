/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';

import {Log} from '../../utils/logging.js';

import {Formatter} from './base-formatter.js';

/**
 * Formatter for running clang-format against Typescript and Javascript files
 */
export class ClangFormat extends Formatter {
  override name = 'clang-format';

  override binaryFilePath = join(this.git.baseDir, 'node_modules/.bin/clang-format');

  override defaultFileMatcher = ['**/*.{t,j,cj,mj}s'];

  override actions = {
    check: {
      commandFlags: `--Werror -n -style=file`,
      callback: (_: string, code: number | NodeJS.Signals) => {
        return code !== 0;
      },
    },
    format: {
      commandFlags: `-i -style=file`,
      callback: (file: string, code: number | NodeJS.Signals, _: string, stderr: string) => {
        if (code !== 0) {
          Log.error(`Error running clang-format on: ${file}`);
          Log.error(stderr);
          Log.error();
          return true;
        }
        return false;
      },
    },
  };
}
