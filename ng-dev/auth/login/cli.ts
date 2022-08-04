import {Argv, CommandModule} from 'yargs';
import {bold, Log} from '../../utils/logging.js';
import {loginToFirebase} from '../shared/firebase.js';
import {requestNgDevToken, getCurrentUser} from '../shared/ng-dev-token.js';
import {canUseNgDevService} from '../../utils/ng-dev-service.js';

export interface Options {}

/** Builds the command. */
function builder(yargs: Argv) {
  return canUseNgDevService(yargs, /* isAuthCommand */ true) as Argv;
}

/** Handles the command. */
async function handler() {
  /** The currently logged in user, if a user is logged in. */
  const user = await getCurrentUser();
  if (user) {
    Log.info(`Already logged in as ${bold(user.email)}`);
    return;
  }

  if (await loginToFirebase()) {
    const {email} = await requestNgDevToken();
    const expireTimestamp = new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString();
    Log.info(`Logged in as ${bold(email)}`);
    Log.info(`Credential will expire in ~20 hours (${expireTimestamp})`);
  } else {
    Log.error('Login failed');
  }
}

/** yargs command module for logging into the ng-dev service. */
export const LoginModule: CommandModule<{}, Options> = {
  handler,
  builder,
  command: 'login',
  describe: 'Log into the ng-dev service',
};
