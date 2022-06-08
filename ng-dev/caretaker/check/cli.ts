/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs.js';

import {checkServiceStatuses} from './check.js';

export interface CaretakerCheckOptions {
  githubToken: string;
}

/** Builds the command. */
function builder(argv: Argv) {
  return addGithubTokenOption(argv);
}

/** Handles the command. */
async function handler() {
  await checkServiceStatuses();
}

/** yargs command module for checking status information for the repository  */
export const CheckModule: CommandModule<{}, CaretakerCheckOptions> = {
  handler,
  builder,
  command: 'check',
  describe: 'Check the status of information the caretaker manages for the repository',
};
