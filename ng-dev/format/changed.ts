/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';

import {GitClient} from '../utils/git/git-client.js';
import {checkFiles, formatFiles} from './format.js';

/** Command line options. */
export interface Options {
  shaOrRef?: string;
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
    .positional('shaOrRef', {type: 'string'});
}

/** Yargs command handler for the command. */
async function handler({shaOrRef, check}: Arguments<Options>) {
  const git = await GitClient.get();
  const sha = shaOrRef || git.mainBranchName;
  const executionCmd = check ? checkFiles : formatFiles;
  const allChangedFilesSince = git.allChangesFilesSince(sha);
  process.exitCode = await executionCmd(allChangedFilesSince);
}

/** CLI command module. */
export const ChangedModule: CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'changed [shaOrRef]',
  describe: 'Run the formatter on files changed since the provided sha/ref',
};
