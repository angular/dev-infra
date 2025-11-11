/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv} from 'yargs';
import {ValidateModule} from './validate/cli.js';

/** Build the parser for the release commands. */
export function buildConfigParser(localYargs: Argv) {
  return localYargs.help().strict().demandCommand().command(ValidateModule);
}
