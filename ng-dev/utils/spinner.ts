/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {cursorTo, clearLine} from 'readline';

/** ANSI escape code to hide cursor in terminal. */
const hideCursor = '\x1b[?25l';
/** ANSI escape code to show cursor in terminal. */
const showCursor = '\x1b[?25h';

export class Spinner {
  /** Whether the spinner is currently running. */
  private isRunning = true;
  /** The id of the interval being used to trigger frame printing. */
  private intervalId = setInterval(() => this.printFrame(), 125);
  /** The characters to iterate through to create the appearance of spinning in the spinner. */
  private spinnerCharacters = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  /** The index of the spinner character used in the frame. */
  private currentSpinnerCharacterIndex = 0;
  /** The current text of the spinner. */
  private text: string = '';

  constructor(text: string) {
    process.stdout.write(hideCursor);
    this.update(text);
  }

  /** Get the next spinner character. */
  private getNextSpinnerCharacter() {
    this.currentSpinnerCharacterIndex =
      (this.currentSpinnerCharacterIndex + 1) % this.spinnerCharacters.length;
    return this.spinnerCharacters[this.currentSpinnerCharacterIndex];
  }

  /** Print the current text for the spinner to the  */
  private printFrame(prefix = this.getNextSpinnerCharacter(), text = this.text) {
    cursorTo(process.stdout, 0);
    process.stdout.write(` ${prefix} ${text}`);
    // Clear to the right of the cursor location in case the new frame is shorter than the previous.
    clearLine(process.stdout, 1);
    cursorTo(process.stdout, 0);
  }

  /** Updates the spinner text with the provided text. */
  update(text: string) {
    this.text = text;
    this.printFrame(this.spinnerCharacters[this.currentSpinnerCharacterIndex]);
  }

  /** Completes the spinner. */
  complete(): void;
  complete(text: string): void;
  complete(text?: string) {
    if (!this.isRunning) {
      return;
    }
    clearInterval(this.intervalId);
    clearLine(process.stdout, 1);
    cursorTo(process.stdout, 0);
    if (text) {
      process.stdout.write(text);
      process.stdout.write('\n');
    }
    process.stdout.write(showCursor);
    this.isRunning = false;
  }
}
