import {Argv, CommandModule} from 'yargs';
import {Log} from '../../utils/logging.js';

export interface Options {}

/** Builds the command. */
async function builder(yargs: Argv) {
  return yargs;
}

/** Handles the command. */
async function handler() {
  Log.warn('ng-dev auth logout has been deprecated. Authentication will be done');
  Log.warn('using local environment.');
}

/** yargs command module for logging out of the ng-dev service. */
export const LogoutModule: CommandModule<{}, Options> = {
  handler,
  builder,
  command: 'logout',
  describe: 'Log out of the ng-dev service',
};
