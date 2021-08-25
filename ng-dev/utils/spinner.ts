/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
  /** The id of the interval being used to trigger frame printing. */
  private intervalId = setInterval(() => this.printFrame(), 125);
  /** The characters to iterate through to create the appearance of spinning in the spinner. */
  private spinnerCharacters = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  /** The index of the spinner character used in the frame. */
  private currentSpinnerCharacterIndex = 0;

  constructor(private text: string) {
    process.stdout.write(hideCursor);
  }

  /** Get the next spinner character. */
  private getNextSpinnerCharacter() {
    this.currentSpinnerCharacterIndex =
      (this.currentSpinnerCharacterIndex % this.spinnerCharacters.length) + 1;
    return this.spinnerCharacters[this.currentSpinnerCharacterIndex - 1];
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
  }

  /** Completes the spinner. */
  complete() {
    clearInterval(this.intervalId);
    process.stdout.write('\n');
    process.stdout.write(showCursor);
  }
}
