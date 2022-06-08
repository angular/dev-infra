/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv} from 'yargs';

import {BuildAndLinkCommandModule} from './build-and-link/cli.js';
import {NewMainBranchCommandModule} from './new-main-branch/cli.js';
import {UpdateYarnCommandModule} from './update-yarn/cli.js';

/** Build the parser for the misc commands. */
export function buildMiscParser(localYargs: Argv) {
  return localYargs
    .help()
    .strict()
    .command(BuildAndLinkCommandModule)
    .command(NewMainBranchCommandModule)
    .command(UpdateYarnCommandModule);
}
