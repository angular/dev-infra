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

/**
 * Sets up middleware to ensure that configuration and setup is completed for commands which
 *  require the ng-dev service
 */
export function canUseNgDevService<T extends {}>(
  argv: Argv<T>,
  isAuthCommand: true,
): Argv<T & {useAuthService: boolean}>;
export function canUseNgDevService<T extends {githubToken: string | null}>(
  argv: Argv<T>,
): Argv<T & {useAuthService: boolean}>;
export function canUseNgDevService<T extends {githubToken: string | null}>(
  argv: Argv<T>,
  isAuthCommand: boolean = false,
): Argv<T> {
  return (
    argv
      .option('use-auth-service' as 'useAuthService', {
        type: 'boolean',
        default: false,
      })
      // TODO(josephperrott): Show flags once this tooling is rolled out.
      .hide('use-auth-service')
      .middleware(async (args: Arguments<T & {useAuthService: boolean}>) => {
        initializeApp(firebaseConfig);
        await restoreNgTokenFromDiskIfValid();

        if (args.useAuthService === false) {
          return;
        }
        args.githubToken = null;

        if (isAuthCommand) {
          Log.debug('Skipping ng-dev token request as this is an auth command');
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
        argv.exit(1, new Error('The user is not logged in'));
      })
  );
}
