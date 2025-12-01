/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv} from 'yargs';
import {CheckModule} from './check/cli.js';
import {HandoffModule} from './handoff/cli.js';
import {MergeModeModule} from './merge-mode/cli.js';

/** Build the parser for the caretaker commands. */
export function buildCaretakerParser(argv: Argv) {
  return argv.command(MergeModeModule).command(CheckModule).command(HandoffModule);
}
