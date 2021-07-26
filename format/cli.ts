/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';

import {allChangedFilesSince, allFiles} from '../utils/repo-files';

import {checkFiles, formatFiles} from './format';

/** Build the parser for the format commands. */
export function buildFormatParser(localYargs: yargs.Argv) {
  return localYargs.help()
      .strict()
      .demandCommand()
      .option('check', {
        type: 'boolean',
        default: process.env['CI'] ? true : false,
        description: 'Run the formatter to check formatting rather than updating code format'
      })
      .command(
          'all', 'Run the formatter on all files in the repository', {},
          ({check}) => {
            const executionCmd = check ? checkFiles : formatFiles;
            executionCmd(allFiles());
          })
      .command(
          'changed [shaOrRef]', 'Run the formatter on files changed since the provided sha/ref', {},
          ({shaOrRef, check}) => {
            const sha = shaOrRef || 'master';
            const executionCmd = check ? checkFiles : formatFiles;
            executionCmd(allChangedFilesSince(sha));
          })
      .command('files <files..>', 'Run the formatter on provided files', {}, ({check, files}) => {
        const executionCmd = check ? checkFiles : formatFiles;
        executionCmd(files);
      });
}

if (require.main === module) {
  buildFormatParser(yargs).parse();
}
