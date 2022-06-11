/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';
import {copyTestResultFiles} from './index.js';
import {Log} from '../../utils/logging.js';
/** Command line options. */
export interface Options {
  force: boolean;
}

/** Yargs command builder for the command. */
function builder(argv: Argv): Argv<Options> {
  return argv.option('force', {
    type: 'boolean',
    default: false,
    description: 'Whether to force the command to run, ignoring the CI environment check',
  });
}

/** Yargs command handler for the command. */
async function handler({force}: Arguments<Options>) {
  if (force === false && process.env['CI'] === undefined) {
    Log.error('Aborting, `gather-test-results` is only meant to be run on CI.');
    process.exit(1);
  }
  await copyTestResultFiles();
}

/** CLI command module. */
export const GatherTestResultsModule: CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'gather-test-results',
  describe: 'Gather test result files into single directory for consumption by CircleCI',
};
