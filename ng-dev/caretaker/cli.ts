/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {info} from 'console';
import {Argv} from 'yargs';
import {assertValidGithubConfig, getConfig} from '../utils/config.js';
import {CheckModule} from './check/cli.js';
import {assertValidCaretakerConfig} from './config.js';
import {HandoffModule} from './handoff/cli.js';

/** Build the parser for the caretaker commands. */
export function buildCaretakerParser(argv: Argv) {
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
