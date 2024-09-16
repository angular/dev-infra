/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {confirm, input, checkbox, select, editor} from '@inquirer/prompts';

/**
 * A set of prompts from inquirer to be used throughout our tooling.  We access them via static metonds on this
 * class to allow easier mocking management in test environments.
 */
export class Prompt {
  static confirm: typeof confirm = confirm;
  static input: typeof input = input;
  static checkbox: typeof checkbox = checkbox;
  static select: typeof select = select;
  static editor: typeof editor = editor;
}
