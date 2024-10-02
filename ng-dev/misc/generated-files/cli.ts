/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, CommandModule} from 'yargs';
import {updateGeneratedFileTargets} from './update-generated-files.js';

async function builder(argv: Argv) {
  return argv;
}
async function handler() {
  await updateGeneratedFileTargets();
}

/** CLI command module. */
export const GeneratedFilesModule: CommandModule = {
  builder,
  handler,
  command: 'update-generated-files',
  describe: 'Automatically discover all bazel generated file targets and update them.',
};
