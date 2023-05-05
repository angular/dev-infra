import {Argv, CommandModule} from 'yargs';
import {Log} from '../../utils/logging.js';

export interface Options {}

/** Builds the command. */
async function builder(yargs: Argv) {
  return yargs;
}

/** Handles the command. */
async function handler() {
  Log.warn('ng-dev auth login has been deprecated. Authentication will be done');
  Log.warn('using local environment.');
}

/** yargs command module for logging into the ng-dev service. */
export const LoginModule: CommandModule<{}, Options> = {
  handler,
  builder,
  command: 'login',
  describe: 'Log into the ng-dev service',
};
