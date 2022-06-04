/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import yargs from 'yargs';
import {GitClient} from '../utils/git/git-client';

import {checkFiles, formatFiles} from './format';

/** Build the parser for the format commands. */
export function buildFormatParser(localYargs: yargs.Argv) {
  return localYargs
    .help()
    .strict()
    .demandCommand()
    .option('check', {
      type: 'boolean',
      default: process.env['CI'] ? true : false,
      description: 'Run the formatter to check formatting rather than updating code format',
    })
    .command(
      'all',
      'Run the formatter on all files in the repository',
      (args) => args,
      async ({check}) => {
        const executionCmd = check ? checkFiles : formatFiles;
        const allFiles = GitClient.get().allFiles();
        process.exitCode = await executionCmd(allFiles);
      },
    )
    .command(
      'changed [shaOrRef]',
      'Run the formatter on files changed since the provided sha/ref',
      (args) => args.positional('shaOrRef', {type: 'string'}),
      async ({shaOrRef, check}) => {
        const git = GitClient.get();
        const sha = shaOrRef || git.mainBranchName;
        const executionCmd = check ? checkFiles : formatFiles;
        const allChangedFilesSince = git.allChangesFilesSince(sha);
        process.exitCode = await executionCmd(allChangedFilesSince);
      },
    )
    .command(
      'staged',
      'Run the formatter on all staged files',
      (args) => args,
      async ({check}) => {
        const executionCmd = check ? checkFiles : formatFiles;
        const allStagedFiles = GitClient.get().allStagedFiles();
        process.exitCode = await executionCmd(allStagedFiles);
        if (!check && process.exitCode === 0) {
          GitClient.get().runGraceful(['add', ...allStagedFiles]);
        }
      },
    )
    .command(
      'files <files..>',
      'Run the formatter on provided files',
      (args) => args.positional('files', {array: true, type: 'string'}),
      async ({check, files}) => {
        const executionCmd = check ? checkFiles : formatFiles;
        process.exitCode = await executionCmd(files!);
      },
    );
}
