/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';

import {checkFiles, formatFiles} from './format.js';

/** Command line options. */
export interface Options {
  files: string[];
  check: boolean;
}

/** Yargs command builder for the command. */
function builder(argv: Argv): Argv<Options> {
  return argv
    .option('check', {
      type: 'boolean',
      default: process.env['CI'] ? true : false,
      description: 'Run the formatter to check formatting rather than updating code format',
    })
    .positional('files', {array: true, type: 'string', demandOption: true});
}

/** Yargs command handler for the command. */
async function handler({files, check}: Arguments<Options>) {
  const executionCmd = check ? checkFiles : formatFiles;
  process.exitCode = await executionCmd(files);
}

/** CLI command module. */
export const FilesModule: CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'files <files..>',
  describe: 'Run the formatter on provided files',
};
