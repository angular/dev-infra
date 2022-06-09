/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';

import {ChildProcess} from '../../utils/child-process';
import {Log} from '../../utils/logging';

import {Formatter} from './base-formatter';

/**
 * Formatter for running prettier against Typescript and Javascript files.
 */
export class Prettier extends Formatter {
  override name = 'prettier';

  override binaryFilePath = join(this.git.baseDir, 'node_modules/.bin/prettier');

  override defaultFileMatcher = [
    '**/*.{js,cjs,mjs}',
    '**/*.{ts,cts,mts}',
    '**/*.json',
    '**/*.{yml,yaml}',
  ];

  /**
   * The configuration path of the prettier config, obtained during construction to prevent needing
   * to discover it repeatedly for each execution.
   */
  private configPath = this.config['prettier']
    ? ChildProcess.spawnSync(this.binaryFilePath, ['--find-config-path', '.']).stdout.trim()
    : '';

  override actions = {
    check: {
      commandFlags: `--config ${this.configPath} --check`,
      callback: (_: string, code: number | NodeJS.Signals, stdout: string) => {
        return code !== 0;
      },
    },
    format: {
      commandFlags: `--config ${this.configPath} --write`,
      callback: (file: string, code: number | NodeJS.Signals, _: string, stderr: string) => {
        if (code !== 0) {
          Log.error(`Error running prettier on: ${file}`);
          Log.error(stderr);
          Log.error();
          return true;
        }
        return false;
      },
    },
  };
}
