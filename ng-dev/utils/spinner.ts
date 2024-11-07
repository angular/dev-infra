/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {cursorTo, clearLine} from 'readline';
import {green, red} from './logging.js';

/** Whether execution is in a CI environment. */
const IS_CI = process.env['CI'];
/** ANSI escape code to hide cursor in terminal. */
const hideCursor = '\x1b[?25l';
/** ANSI escape code to show cursor in terminal. */
const showCursor = '\x1b[?25h';

export class Spinner {
  /** Whether the spinner is marked as completed. */
  private completed = false;
  /** The id of the interval being used to trigger frame printing. */
  private intervalId = setInterval(() => this.printFrame(), IS_CI ? 2500 : 125);
  /** The characters to iterate through to create the appearance of spinning in the spinner. */
  private spinnerCharacters = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  /** The index of the spinner character used in the frame. */
  private currentSpinnerCharacterIndex = 0;
  /** The current text of the spinner. */
  private _text: string = '';
  private set text(text: string | undefined) {
    this._text = text || this._text;
    this.printFrame(this.getNextSpinnerCharacter(), text);
  }
  private get text(): string {
    return this._text;
  }

  constructor();
  constructor(text: string);
  constructor(text?: string) {
    this.hideCursor();
    this.text = text;
  }

  /** Updates the spinner text with the provided text. */
  update(text: string) {
    this.text = text;
  }

  /** Completes the spinner marking it as successful with a `✓`. */
  success(text: string): void {
    this._complete(green('✓'), text);
  }

  /** Completes the spinner marking it as failing with an `✘`. */
  failure(text: string): void {
    this._complete(red('✘'), text);
  }

  /** Completes the spinner. */
  complete() {
    this._complete('', this.text);
  }

  /**
   * Internal implementation for completing the spinner, marking it as completed, and printing the
   * final frame.
   */
  private _complete(prefix: string, text: string) {
    if (this.completed) {
      return;
    }
    clearInterval(this.intervalId);
    this.printFrame(prefix, text);
    process.stdout.write('\n');
    this.showCursor();
    this.completed = true;
  }

  /** Get the next spinner character. */
  private getNextSpinnerCharacter() {
    this.currentSpinnerCharacterIndex =
      (this.currentSpinnerCharacterIndex + 1) % this.spinnerCharacters.length;
    return this.spinnerCharacters[this.currentSpinnerCharacterIndex];
  }

  /**
   * Print the next frame either in CI mode or local terminal mode based on whether the script is run in a
   * CI environment.
   */
  private printFrame(prefix = this.getNextSpinnerCharacter(), text?: string): void {
    if (IS_CI) {
      this.printNextCIFrame(text);
    } else {
      this.printNextLocalFrame(prefix, text);
    }
  }

  /** Print the current text for the spinner to the terminal.  */
  private printNextLocalFrame(prefix: string, text?: string) {
    cursorTo(process.stdout, 0);
    process.stdout.write(` ${prefix} ${text || this.text}`);
    // Clear to the right of the cursor location in case the new frame is shorter than the previous.
    clearLine(process.stdout, 1);
  }

  /** Print the next expected piece for the spinner to stdout for CI usage.  */
  private printNextCIFrame(text?: string) {
    if (text) {
      process.stdout.write(`\n${text}.`);
      return;
    }
    process.stdout.write('.');
  }

  /** Hide the cursor in the terminal, only executed in local environments. */
  private hideCursor() {
    if (!IS_CI) {
      process.stdout.write(hideCursor);
    }
  }

  /** Resume showing the cursor in the terminal, only executed in local environments. */
  private showCursor() {
    if (!IS_CI) {
      process.stdout.write(showCursor);
    }
  }
}
