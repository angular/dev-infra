/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';
import {Log, green, red} from '../../utils/logging.js';
import {determineRepoBaseDirFromCwd} from '../../utils/repo-directory.js';

import {checkAllLicenses} from './validate.js';

/** Command line options. */
export interface Options {}

/** Yargs command builder for the command. */
function builder(argv: Argv): Argv<Options> {
  return argv;
}

/** Yargs command handler for the command. */
async function handler({}: Arguments<Options>) {
  try {
    const {valid, maxPkgNameLength, packages} = await checkAllLicenses(
      determineRepoBaseDirFromCwd(),
    );
    if (valid) {
      Log.info(
        `  ${green('✓')}  All discovered licenses comply with our restrictions (${
          packages.length
        } packages)`,
      );
      return;
    }

    Log.info(red(' ✘ The following packages were found to have disallowed licenses:\n'));
    Log.info(`${'     Package Name'.padEnd(maxPkgNameLength)}     |      LICENSE`);
    packages
      .filter((pkg) => !pkg.allowed)
      .forEach((pkg) => {
        Log.info(`  - ${pkg.name.padEnd(maxPkgNameLength)} | ${pkg.licenses}`);
      });
    process.exitCode = 1;
  } catch (err) {
    Log.info(red(' ✘ An error occured while processing package licenses:'));
    Log.error(err);
    process.exitCode = 1;
  }
}

/** CLI command module. */
export const ValidateLicensesModule: CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'validate-licenses',
  describe: 'Validate the licenses for all dependencies in the project',
};
