/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {validateSkills} from './validate.js';
import {determineRepoBaseDirFromCwd} from '../../utils/repo-directory.js';

interface Options {
  baseDir: string;
}

async function builder(yargs: Argv) {
  return yargs.option('base-dir' as 'baseDir', {
    type: 'string',
    default: determineRepoBaseDirFromCwd(),
    hidden: true,
    description: 'The base directory to look for skills in',
  });
}

async function handler({baseDir}: Arguments<Options>) {
  process.exitCode = (await validateSkills(baseDir)).exitCode;
}

/**
 * Validates all skills found in the `skills/` directory.
 */
export const SkillsModule: CommandModule<{}, Options> = {
  command: 'skills validate',
  describe: 'Validate agent skills in the repository',
  builder,
  handler,
};
