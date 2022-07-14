import {Argv, CommandModule} from 'yargs';
import {bold, Log} from '../../utils/logging.js';
import {invokeServerFunction, getCurrentUser} from '../shared/ng-dev-token.js';
import {requiresNgDevService} from '../../utils/ng-dev-service.js';

export interface Options {}

/** Builds the command. */
function builder(yargs: Argv) {
  return requiresNgDevService(yargs);
}

/** Handles the command. */
async function handler() {
  /** The currently logged in user email, if a user is logged in. */
  const email = await getCurrentUser();
  if (email) {
    await invokeServerFunction<{}, void>('ngDevRevokeToken');
    Log.info(`Successfully logged out, ${bold(email)}.`);
    return;
  }
  Log.info('No user currently logged in.');
}

/** yargs command module for logging out of the ng-dev service. */
export const LogoutModule: CommandModule<{}, Options> = {
  handler,
  builder,
  command: 'logout',
  describe: 'Log out of the ng-dev service',
};
