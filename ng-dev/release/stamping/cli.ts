/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import yargs from 'yargs';

import {buildEnvStamp, EnvStampMode} from './env-stamp';

export interface Options {
  mode: EnvStampMode;
  includeVersion: boolean;
}

function builder(args: yargs.Argv): yargs.Argv<Options> {
  return args
    .option('mode', {
      demandOption: true,
      description: 'Whether the env-stamp should be built for a snapshot or release',
      choices: ['snapshot' as const, 'release' as const],
    })
    .option('includeVersion', {
      type: 'boolean',
      description: 'Whether the version should be included in the stamp.',
      default: true,
    });
}

async function handler({mode, includeVersion}: yargs.Arguments<Options>) {
  buildEnvStamp(mode, includeVersion);
}

/** CLI command module for building the environment stamp. */
export const BuildEnvStampCommand: yargs.CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'build-env-stamp',
  describe: 'Build the environment stamping information',
};
