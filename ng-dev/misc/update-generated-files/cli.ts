/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';
import {updateAllGeneratedFileTargets} from './index';

/** Command line options. */
export interface Options {}

/** Yargs command builder for the command. */
function builder(argv: Argv): Argv<Options> {
  return argv;
}

/** Yargs command handler for the command. */
async function handler({}: Arguments<Options>) {
  const {succeeded} = updateAllGeneratedFileTargets();

  if (!succeeded) {
    process.exitCode = 1;
    return;
  }
}

/** CLI command module. */
export const UpdateGeneratedFilesModule: CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'update-generated-files',
  describe: 'Updates all generated files in the repository tagged for generation.',
};
