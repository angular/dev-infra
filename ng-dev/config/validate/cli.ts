/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv, CommandModule} from 'yargs';
import {green, Log, red} from '../../utils/logging';
import {checkPortability} from './portability';
import {checkValidity} from './validity';
import {ConfigValidationError} from '../../utils/config';

export interface Options {}

/** Builds the command. */
async function builder(yargs: Argv) {
  return yargs;
}

/** Handles the command. */
async function handler() {
  try {
    await checkPortability();
    await checkValidity();
    Log.info(`${green('✓')} ng-dev configuration validation passed`);
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      error.errors.forEach((e) => Log.info(e));
    } else {
      Log.info(error);
    }
    Log.info(`${red('✘')} ng-dev configuration validation failed, see above for more details`);
  }
}

/** yargs command module for logging into the ng-dev service. */
export const ValidateModule: CommandModule<{}, Options> = {
  handler,
  builder,
  command: 'validate',
  describe: 'Validate that the configuration provided in .ng-dev/ is valid and portable',
};
