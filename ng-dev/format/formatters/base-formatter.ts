/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../utils/git/git-client.js';
import {FormatConfig} from '../config.js';

// A callback to determine if the formatter run found a failure in formatting.
export type CallbackFunc = (
  file: string,
  code: number | NodeJS.Signals,
  stdout: string,
  stderr: string,
) => boolean;

// The actions a formatter can take.
export type FormatterAction = 'check' | 'format';

// The metadata needed for running one of the `FormatterAction`s on a file.
interface FormatterActionMetadata {
  commandFlags: string[];
  callback: CallbackFunc;
}

/**
 * The base class for formatters to run against provided files.
 */
export abstract class Formatter {
  /**
   * The name of the formatter, this is used for identification in logging and for enabling and
   * configuring the formatter in the config.
   */
  abstract name: keyof FormatConfig;

  /** The full path file location of the formatter binary. */
  abstract binaryFilePath: string;

  /** Metadata for each `FormatterAction` available to the formatter. */
  abstract actions: {
    // An action performing a check of format without making any changes.
    check: FormatterActionMetadata;
    // An action to format files in place.
    format: FormatterActionMetadata;
  };

  /** The default matchers for the formatter for filtering files to be formatted. */
  abstract matchers: string[];

  constructor(
    protected git: GitClient,
    protected config: FormatConfig,
  ) {}

  /**
   * Retrieve the command to execute the provided action, including both the binary
   * and command line flags.
   */
  commandFor(action: FormatterAction): string[] {
    switch (action) {
      case 'check':
        return [this.binaryFilePath, ...this.actions.check.commandFlags];
      case 'format':
        return [this.binaryFilePath, ...this.actions.format.commandFlags];
      default:
        throw Error('Unknown action type');
    }
  }

  /**
   * Retrieve the callback for the provided action to determine if an action
   * failed in formatting.
   */
  callbackFor(action: FormatterAction) {
    switch (action) {
      case 'check':
        return this.actions.check.callback;
      case 'format':
        return this.actions.format.callback;
      default:
        throw Error('Unknown action type');
    }
  }

  /** Whether the formatter is enabled in the provided config. */
  isEnabled() {
    return !!this.config[this.name];
  }

  /** Retrieve the active file matcher for the formatter. */
  getFileMatcher() {
    return this.config[this.name] ? this.matchers : [];
  }

  /**
   * Determines the 1-based line number of the first formatting or lint issue in `file`, if known.
   */
  async getFailureLine(
    _file: string,
    _action: FormatterAction,
    _code: number | NodeJS.Signals,
    _stdout: string,
    _stderr: string,
  ): Promise<number | undefined> {
    return undefined;
  }
}

/**
 * Compares original and formatted file contents and returns the 1-based line number of the first
 * differing line, or `undefined` if both strings are identical.
 */
export function findFirstDifferingLine(original: string, formatted: string): number | undefined {
  if (original === formatted) {
    return undefined;
  }
  const splitLines = (content: string) =>
    content === '' ? [] : content.replace(/\r?\n$/, '').split(/\r?\n/);
  const originalLines = splitLines(original);
  const formattedLines = splitLines(formatted);
  const maxOriginalLine = Math.max(originalLines.length, 1);
  const maxLines = Math.max(originalLines.length, formattedLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (originalLines[i] !== formattedLines[i]) {
      // Clamp to the last existing line in the original file (1-based) so annotations
      // anchor to a valid line in the file.
      return Math.min(i + 1, maxOriginalLine);
    }
  }
  // Lines matched ignoring line endings (e.g. CRLF vs LF); find first raw line difference.
  const splitRawLines = (content: string) =>
    content === '' ? [] : content.replace(/\n$/, '').split('\n');
  const originalRawLines = splitRawLines(original);
  const formattedRawLines = splitRawLines(formatted);
  const maxRawLines = Math.max(originalRawLines.length, formattedRawLines.length);
  for (let i = 0; i < maxRawLines; i++) {
    if (originalRawLines[i] !== formattedRawLines[i]) {
      return Math.min(i + 1, maxOriginalLine);
    }
  }
  // Only difference is the presence or absence of a trailing newline at EOF.
  return maxOriginalLine;
}
