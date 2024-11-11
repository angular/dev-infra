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
  static confirm: typeof confirm = (
    // These are extractions of the PromptConfig from the inquirer types.
    _config: Parameters<typeof confirm>[0],
    _context: Parameters<typeof confirm>[1],
  ) => {
    /** Config to use when creating a confirm prompt, changes the default to `false` instead of `true`. */
    const config = {
      default: false,
      ..._config,
    };
    return confirm(config, _context);
  };
  static input: typeof input = input;
  static checkbox: typeof checkbox = checkbox;
  static select: typeof select = select;
  static editor: typeof editor = editor;
}
