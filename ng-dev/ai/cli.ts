/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv} from 'yargs';
import {MigrateModule} from './migrate.js';
import {FixModule} from './fix.js';

/** Build the parser for the AI commands. */
export function buildAiParser(localYargs: Argv) {
  return localYargs.command(MigrateModule).command(FixModule);
}
