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

/** Shape of a file entry in `buildifier --format=json` output. */
interface BuildifierJsonResult {
  success?: boolean;
  files?: Array<{
    formatted?: boolean;
    valid?: boolean;
    warnings?: Array<{start?: {line?: number}}>;
  }>;
}

/**
 * Formatter for running buildifier against bazel related files.
 */
export class Buildifier extends Formatter {
  override readonly name = 'buildifier';

  override binaryFilePath = join(this.git.baseDir, 'node_modules/.bin/buildifier');

  override matchers = ['**/*.bzl', '**/*.bazel', '**/WORKSPACE', '**/BUILD'];

  override actions = {
    check: {
      commandFlags: [BAZEL_WARNING_FLAG, '--lint=warn', '--mode=check', '--format=json'],
      callback: (_: string, code: number | NodeJS.Signals, stdout: string) => {
        // For cases where `stdout` is empty, we instead use an empty object to still allow parsing.
        stdout = stdout || '{}';
        return code !== 0 || !(JSON.parse(stdout) as {success: boolean}).success;
      },
    },
    format: {
      commandFlags: [BAZEL_WARNING_FLAG, '--lint=fix', '--mode=fix'],
      callback: (file: string, code: number | NodeJS.Signals, _: string, stderr: string) => {
        if (code !== 0) {
          Log.error(`Error running buildifier on: ${file}`);
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
    stdout: string,
    stderr: string,
  ): Promise<number | undefined> {
    // Buildifier syntax errors include `<path>:<line>:<col>: ...` in stderr.
    const syntaxErrorMatch = /:(\d+):\d+:/.exec(stderr);
    if (syntaxErrorMatch) {
      const line = Number(syntaxErrorMatch[1]);
      return line >= 1 ? line : undefined;
    }

    if (action !== 'check') {
      return undefined;
    }

    const candidateLines: number[] = [];
    let needsFormatDiff = false;

    try {
      const parsed = JSON.parse(stdout || '{}') as BuildifierJsonResult;
      const fileResult = parsed.files?.[0];
      for (const warning of fileResult?.warnings ?? []) {
        const line = warning.start?.line;
        if (typeof line === 'number' && line >= 1) {
          candidateLines.push(line);
        }
      }
      needsFormatDiff = fileResult?.formatted === false && fileResult?.valid !== false;
    } catch {
      return undefined;
    }

    if (needsFormatDiff) {
      try {
        const {status, stdout: formattedStdout} = await ChildProcess.spawn(
          this.binaryFilePath,
          ['--mode=print_if_changed', '--', file],
          {suppressErrorOnFailingExitCode: true, mode: 'silent'},
        );
        if (status === 0) {
          const original = readFileSync(file, 'utf8');
          if (formattedStdout !== '' || original.trim() === '') {
            const diffLine = findFirstDifferingLine(original, formattedStdout);
            if (diffLine !== undefined) {
              candidateLines.push(diffLine);
            }
          }
        }
      } catch {
        // Fall back to any warning lines discovered above.
      }
    }

    return candidateLines.length > 0 ? Math.min(...candidateLines) : undefined;
  }
}

// The warning flag for buildifier copied from angular/angular's usage.
const BAZEL_WARNING_FLAG =
  `--warnings=attr-cfg,attr-license,attr-non-empty,attr-output-default,` +
  `attr-single-file,ctx-args,depset-iteration,depset-union,dict-concatenation,` +
  `duplicated-name,filetype,git-repository,http-archive,integer-division,load,` +
  `native-build,native-package,output-group,package-name,package-on-top,positional-args,` +
  `redefined-variable,repository-name,string-iteration,unused-variable`;
