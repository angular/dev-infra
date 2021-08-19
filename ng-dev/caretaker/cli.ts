/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {info} from 'console';
import {Arguments, Argv} from 'yargs';
import {getConfig} from '../utils/config';
import {CheckModule} from './check/cli';
import {assertValidCaretakerConfig} from './config';
import {HandoffModule} from './handoff/cli';

/** Build the parser for the caretaker commands. */
export function buildCaretakerParser(yargs: Argv) {
  return yargs
    .middleware(caretakerCommandCanRun, false)
    .command(CheckModule)
    .command(HandoffModule);
}

function caretakerCommandCanRun(argv: Arguments) {
  const config = getConfig();
  try {
    assertValidCaretakerConfig(config);
  } catch {
    info('The `caretaker` command is not enabled in this repository.');
    info(`   To enable it, provide a caretaker config in the repository's .ng-dev/ directory`);
    process.exit(1);
  }
}
