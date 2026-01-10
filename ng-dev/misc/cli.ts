/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv} from 'yargs';

import {SyncModuleBazelModule} from './sync-module-bazel/cli.js';
import {BuildAndLinkCommandModule} from './build-and-link/cli.js';
import {GeneratedFilesModule} from './generated-files/cli.js';

/** Build the parser for the misc commands. */
export function buildMiscParser(localYargs: Argv) {
  return localYargs
    .help()
    .strict()
    .command(SyncModuleBazelModule)
    .command(BuildAndLinkCommandModule)
    .command(GeneratedFilesModule);
}
