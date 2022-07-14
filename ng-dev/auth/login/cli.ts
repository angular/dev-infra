import {Argv, CommandModule} from 'yargs';
import {bold, Log} from '../../utils/logging.js';
import {loginToFirebase} from '../shared/firebase.js';
import {requestNgDevToken, getCurrentUser} from '../shared/ng-dev-token.js';
import {requiresNgDevService} from '../../utils/ng-dev-service.js';

export interface Options {}

/** Builds the command. */
function builder(yargs: Argv) {
  return requiresNgDevService(yargs) as Argv;
}

/** Handles the command. */
async function handler() {
  /** The currently logged in user email, if a user is logged in. */
  const email = await getCurrentUser();
  if (email) {
    Log.info(`Already logged in as ${bold(email)}`);
    return;
  }

  /** Whether the user successfully logged into Firebase to request a token. */
  const isLoggedIntoFirebase = await loginToFirebase();
  if (isLoggedIntoFirebase) {
    await requestNgDevToken();

    const expireTimestamp = new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString();
    Log.info(`Logged in as ${bold(await getCurrentUser())}`);
    Log.info(`Credential will expire in ~20 hours (${expireTimestamp})`);
  } else {
    Log.error('Login failed');
  }
}

/** yargs command module for assisting in handing off caretaker.  */
export const LoginModule: CommandModule<{}, Options> = {
  handler,
  builder,
  command: 'login',
  describe: 'Log into the ng-dev service',
};
