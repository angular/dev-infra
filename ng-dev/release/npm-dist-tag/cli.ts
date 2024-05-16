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
  describe: 'Update the NPM dist tags for release packages.',
  command: 'npm-dist-tag',
  builder: subCommandsBuilder,
  handler: () => {},
};
