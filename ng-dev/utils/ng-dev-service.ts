/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv} from 'yargs';

import {restoreNgTokenFromDiskIfValid} from '../auth/shared/ng-dev-token.js';
import {initializeApp} from 'firebase/app';
import {Log} from './logging.js';

/**
 * Sets up middleware to ensure that configuration and setup is completed for commands which
 *  utilize the ng-dev service
 */
export function requiresNgDevService(argv: Argv): Argv {
  return argv.middleware(async () => {
    try {
      initializeApp({
        apiKey: 'AIzaSyDM3rXWUgYuxYCmBKwnZvvnraYoYIE5_5U',
        authDomain: 'internal-200822.firebaseapp.com',
        projectId: 'internal-200822',
        storageBucket: 'internal-200822.appspot.com',
        messagingSenderId: '823469418460',
        appId: '1:823469418460:web:009b51c93132b218761119',
      });
      await restoreNgTokenFromDiskIfValid();
    } catch (e) {
      Log.debug(e);
    }
  });
}
