/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv} from 'yargs';
import {verify} from './verify.js';

/** Build the parser for the pullapprove commands. */
export function buildPullapproveParser(localYargs: Argv) {
  return localYargs
    .help()
    .strict()
    .demandCommand()
    .command('verify', 'Verify the pullapprove config', {}, () => verify());
}
