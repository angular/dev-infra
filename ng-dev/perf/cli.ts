/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv} from 'yargs';

import {WorkflowsModule} from './workflow/cli.js';

/** Build the parser for pull request commands. */
export function buildPerfParser(localYargs: Argv) {
  return localYargs.help().strict().demandCommand().command(WorkflowsModule);
}
