/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv, CommandModule} from 'yargs';

import {ReleaseNpmDistTagDeleteCommand} from './delete/cli.js';
import {ReleaseNpmDistTagSetCommand} from './set/cli.js';

function subCommandsBuilder(argv: Argv) {
  return argv
    .help()
    .strict()
    .demandCommand()
    .command(ReleaseNpmDistTagDeleteCommand)
    .command(ReleaseNpmDistTagSetCommand);
}

export const ReleaseNpmDistTagCommand: CommandModule<{}, {}> = {
  // Hidden from help menu as this is primarily for use by the release tooling itself.
  describe: false,
  command: 'npm-dist-tag',

  builder: subCommandsBuilder,
  handler: () => {},
};
