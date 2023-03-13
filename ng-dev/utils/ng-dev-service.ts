/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initializeApp} from 'firebase/app';
import {Arguments, Argv} from 'yargs';

import {
  configureAuthorizedGitClientWithTemporaryToken,
  getCurrentUser,
  restoreNgTokenFromDiskIfValid,
} from '../auth/shared/ng-dev-token.js';
import {assertValidGithubConfig, getConfig} from './config.js';
import {
  addGithubTokenOption,
  configureGitClientWithTokenOrFromEnvironment,
} from './git/github-yargs.js';
import {Log} from './logging.js';

/** Configuration for the firebase application used for ng-dev token management. */
const firebaseConfig = {
  apiKey: 'AIzaSyDM3rXWUgYuxYCmBKwnZvvnraYoYIE5_5U',
  authDomain: 'internal-200822.firebaseapp.com',
  projectId: 'internal-200822',
  storageBucket: 'internal-200822.appspot.com',
  messagingSenderId: '823469418460',
  appId: '1:823469418460:web:009b51c93132b218761119',
};

/** Whether or not the middleware has already been run. */
let ngDevServiceMiddlewareHasRun = false;

/**
 * Sets up middleware to ensure that configuration and setup is completed for commands which
 *  require the ng-dev service
 */
export async function useNgDevService<T>(argv: Argv<T>): Promise<Argv<T>>;
export async function useNgDevService<T>(argv: Argv<T>, isAuthCommand: true): Promise<Argv<T>>;
export async function useNgDevService<T>(
  argv: Argv<T>,
  isAuthCommand: boolean = false,
): Promise<Argv<T>> {
  const {github} = await getConfig([assertValidGithubConfig]);

  if (github.useNgDevAuthService !== true) {
    return addGithubTokenOption(argv);
  }

  return (
    argv
      // TODO(josephperrott): remove once stability is validated.
      .option('github-escape-hatch' as 'githubEscapeHatch', {
        type: 'boolean',
        hidden: true,
      })
      .option('github-token' as 'githubToken', {
        type: 'string',
        implies: 'github-escape-hatch',
        hidden: true,
      })
      .middleware(async (args) => {
        // TODO(josephperrott): remove this guard against running multiple times after
        //   https://github.com/yargs/yargs/issues/2223 is fixed
        if (ngDevServiceMiddlewareHasRun) {
          return;
        }
        ngDevServiceMiddlewareHasRun = true;

        initializeApp(firebaseConfig);
        await restoreNgTokenFromDiskIfValid();

        if (isAuthCommand) {
          Log.debug('Skipping ng-dev token request as this is an auth command');
          return;
        }

        if (args.githubEscapeHatch === true) {
          // Use the configuration helper to set up the GithubClient using the provided auth
          // token or environment.
          configureGitClientWithTokenOrFromEnvironment(args.githubToken);
          Log.warn('This escape hatch should only be used if the service is erroring. Please');
          Log.warn('inform #dev-infra of using this escape hatch so it can be triaged.');
          return;
        }

        if (await getCurrentUser()) {
          await configureAuthorizedGitClientWithTemporaryToken();
          Log.debug('Logged into github using temporary token');
          return;
        }

        Log.error('  ✘  You must be logged in to run this command\n');
        Log.log('Log in by running the following command:');
        Log.log('  yarn ng-dev auth login');
        throw new Error('The user is not logged in');
      }, true)
  );
}
