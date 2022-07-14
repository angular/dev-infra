/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv} from 'yargs';
import {LoginModule} from './login/cli.js';
import {LogoutModule} from './logout/cli.js';

/** CLI command module. */
export function buildAuthParser(yargs: Argv) {
  return yargs.command(LoginModule).command(LogoutModule);
}
