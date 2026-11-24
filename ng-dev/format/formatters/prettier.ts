/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import {join} from 'path';

import {ChildProcess} from '../../utils/child-process.js';
import {Log} from '../../utils/logging.js';

import {findFirstDifferingLine, Formatter, FormatterAction} from './base-formatter.js';

/**
 * Formatter for running prettier against Typescript and Javascript files.
 */
export class Prettier extends Formatter {
  override readonly name = 'prettier';

  override binaryFilePath = join(this.git.baseDir, 'node_modules/.bin/prettier');

  override matchers = [
    '**/*.{js,cjs,mjs}',
    '**/*.{ts,cts,mts}',
    '**/*.{jsx,tsx}',
    '**/*.{css,scss}',
    '**/*.{json,json5}',
    '**/*.{yml,yaml}',
    '**/*.md',
    '**/*.html',
  ];

  /**
   * The configuration path of the prettier config, obtained during construction to prevent needing
   * to discover it repeatedly for each execution.
   */
  private configPath = this.config['prettier']
    ? ChildProcess.spawnSync(this.binaryFilePath, [
        '--find-config-path',
        join(process.cwd(), 'dummy.js'),
      ]).stdout.trim()
    : '';

  override actions = {
    check: {
      commandFlags: this.configPath ? ['--config', this.configPath, '--check'] : ['--check'],
      callback: (_: string, code: number | NodeJS.Signals, stdout: string) => {
        return code !== 0;
      },
    },
    format: {
      commandFlags: this.configPath ? ['--config', this.configPath, '--write'] : ['--write'],
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

  override async getFailureLine(
    file: string,
    action: FormatterAction,
    _code: number | NodeJS.Signals,
    _stdout: string,
    stderr: string,
  ): Promise<number | undefined> {
    // Prettier syntax errors include `(line:col)` in stderr, e.g. `SyntaxError: ... (2:12)`.
    const syntaxErrorMatch = /\((\d+):\d+\)/.exec(stderr);
    if (syntaxErrorMatch) {
      const line = Number(syntaxErrorMatch[1]);
      return line >= 1 ? line : undefined;
    }

    if (action !== 'check') {
      return undefined;
    }

    try {
      const args = this.configPath ? ['--config', this.configPath, '--', file] : ['--', file];
      const {status, stdout} = await ChildProcess.spawn(this.binaryFilePath, args, {
        suppressErrorOnFailingExitCode: true,
        mode: 'silent',
      });
      if (status !== 0) {
        return undefined;
      }
      return findFirstDifferingLine(readFileSync(file, 'utf8'), stdout);
    } catch {
      return undefined;
    }
  }
}
