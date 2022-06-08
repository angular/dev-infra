/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv} from 'yargs';
import {GatherTestResultsModule} from './gather-test-results/cli.js';

/** Build the parser for the ci commands. */
export function buildCiParser(argv: Argv) {
  return argv.help().strict().command(GatherTestResultsModule);
}
