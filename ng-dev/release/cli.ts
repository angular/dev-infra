/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv} from 'yargs';

import {ReleaseBuildCommandModule} from './build/cli.js';
import {ReleaseInfoCommandModule} from './info/cli.js';
import {ReleaseNotesCommandModule} from './notes/cli.js';
import {ReleasePrecheckCommandModule} from './precheck/cli.js';
import {ReleasePublishCommandModule} from './publish/cli.js';
import {BuildEnvStampCommand} from './stamping/cli.js';
import {ReleaseNpmDistTagCommand} from './npm-dist-tag/cli.js';

/** Build the parser for the release commands. */
export function buildReleaseParser(localYargs: Argv) {
  return localYargs
    .help()
    .strict()
    .demandCommand()
    .command(ReleasePublishCommandModule)
    .command(ReleaseBuildCommandModule)
    .command(ReleaseInfoCommandModule)
    .command(ReleaseNpmDistTagCommand)
    .command(ReleasePrecheckCommandModule)
    .command(BuildEnvStampCommand)
    .command(ReleaseNotesCommandModule);
}
