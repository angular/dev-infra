/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import path from 'path';
import url from 'url';
import {Argv, Arguments, CommandModule} from 'yargs';

import {printEnvStamp, EnvStampMode} from './env-stamp.js';

/**
 * Type describing a custom stamping function that
 * can be exposed through the `--additional-stamping-script`.
 */
export type EnvStampCustomPrintFn = (mode: EnvStampMode) => Promise<void>;

export interface Options {
  mode: EnvStampMode;
  includeVersion: boolean;
  additionalStampingScript: string | undefined;
}

function builder(args: Argv): Argv<Options> {
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
    })
    .option('additionalStampingScript', {
      type: 'string',
      description:
        'Working-dir relative or absolute path to an ESM script which can ' +
        'print additional stamping variables',
    });
}

async function handler({mode, includeVersion, additionalStampingScript}: Arguments<Options>) {
  await printEnvStamp(mode, includeVersion);

  // Support for additional stamping. We import the script and call the default
  // function while providing the stamping mode.
  if (additionalStampingScript !== undefined) {
    const scriptURL = url.pathToFileURL(path.resolve(additionalStampingScript));
    const stampingExports = (await import(scriptURL.toString())) as {
      default: EnvStampCustomPrintFn;
    };
    await stampingExports.default(mode);
  }
}

/** CLI command module for building the environment stamp. */
export const BuildEnvStampCommand: CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'build-env-stamp',
  // Hidden from help menu as this is primarily for use by the release tooling itself.
  describe: false,
};
