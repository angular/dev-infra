/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {cursorTo, clearLine} from 'readline';
import {green, red} from './console';

/** ANSI escape code to hide cursor in terminal. */
const hideCursor = '\x1b[?25l';
/** ANSI escape code to show cursor in terminal. */
const showCursor = '\x1b[?25h';

export class Spinner {
  private static _activeSpinner: Spinner | null = null;

  static get activeSpinner() {
    return this._activeSpinner;
  }
  /** The id of the interval being used to trigger frame printing. */
  private intervalId = setInterval(() => this.printFrame(), 125);
  /** The characters to iterate through to create the appearance of spinning in the spinner. */
  private spinnerCharacters = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  /** The index of the spinner character used in the frame. */
  private currentSpinnerCharacterIndex = 0;

  constructor(private text: string) {
    process.stdout.write(hideCursor);
    Spinner._activeSpinner = this;
  }

  /** Get the next spinner character. */
  private getNextSpinnerCharacter() {
    this.currentSpinnerCharacterIndex =
      (this.currentSpinnerCharacterIndex + 1) % this.spinnerCharacters.length;
    return this.spinnerCharacters[this.currentSpinnerCharacterIndex];
  }

  /** Print the current text for the spinner to the  */
  private printFrame(
    prefix = this.getNextSpinnerCharacter(),
    text = this.text,
    goToNextFrame = false,
  ) {
    if (Spinner._activeSpinner === null) {
      return;
    }
    cursorTo(process.stdout, 0);
    // Clear to the right of the cursor location in case the new frame is shorter than the previous.
    clearLine(process.stdout, 1);
    prefix = prefix ? ` ${prefix} ` : '';
    process.stdout.write(`${prefix}${text}`);
    if (goToNextFrame) {
      process.stdout.write('\n');
    } else {
      cursorTo(process.stdout, 0);
    }
  }

  /** Ends the spinner lifecycle. */
  private end() {
    Spinner._activeSpinner = null;
    clearInterval(this.intervalId);
    process.stdout.write(showCursor);
  }

  /** Updates the spinner text with the provided text. */
  update(text: string) {
    this.text = text;
    return this;
  }

  /** Completes the spinner. */
  complete() {
    this.printFrame('', '');
    this.end();
  }

  /** Completes the spinner with a success message. */
  success(text: string) {
    this.printFrame(green('✓'), text, true);
    this.end();
  }

  /** Completes the spinner with a failure message. */
  failure(text: string) {
    this.printFrame(red('✘'), text, true);
    this.end();
  }

  /**
   * Writes provided text to the current line, with an option prefix character,
   * the spinner continues with its same message on the next line.
   */
  info(text: string, prefix = '') {
    this.printFrame(prefix, text, true);
    return this;
  }
}
