/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {prompt} from 'inquirer';

export abstract class Prompt {
  /** Prompts the user with a confirmation question and a specified message. */
  static async confirm(message: string, defaultValue = false): Promise<boolean> {
    return (
      await prompt<{result: boolean}>({
        type: 'confirm',
        name: 'result',
        message: message,
        default: defaultValue,
      })
    ).result;
  }

  /** Prompts the user for one line of input. */
  static async input(message: string): Promise<string> {
    return (await prompt<{result: string}>({type: 'input', name: 'result', message})).result;
  }
}
