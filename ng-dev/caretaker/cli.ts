/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {info} from 'console';
import yargs from 'yargs';
import {assertValidGithubConfig, getConfig} from '../utils/config';
import {CheckModule} from './check/cli';
import {assertValidCaretakerConfig} from './config';
import {HandoffModule} from './handoff/cli';

/** Build the parser for the caretaker commands. */
export function buildCaretakerParser(argv: yargs.Argv) {
  return argv.middleware(caretakerCommandCanRun, false).command(CheckModule).command(HandoffModule);
}

function caretakerCommandCanRun() {
  try {
    getConfig([assertValidCaretakerConfig, assertValidGithubConfig]);
  } catch {
    info('The `caretaker` command is not enabled in this repository.');
    info(`   To enable it, provide a caretaker config in the repository's .ng-dev/ directory`);
    process.exit(1);
  }
}
