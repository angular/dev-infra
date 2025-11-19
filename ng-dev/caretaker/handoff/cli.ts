/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, CommandModule} from 'yargs';
import {addGithubTokenOption} from '../../utils/git/github-yargs.js';
import {updateCaretakerTeamViaPrompt} from './update-github-team.js';
import {assertValidGithubConfig, getConfig} from '../../utils/config.js';
import {verifyMergeMode} from './verify-merge-mode.js';

/** Builds the command. */
function builder(argv: Argv) {
  return addGithubTokenOption(argv);
}

/** Handles the command. */
async function handler() {
  const {mergeMode} = (await getConfig([assertValidGithubConfig])).github;
  if (!(await verifyMergeMode(mergeMode))) {
    return;
  }
  await updateCaretakerTeamViaPrompt();
}

/** yargs command module for assisting in handing off caretaker.  */
export const HandoffModule: CommandModule<{}, {}> = {
  handler,
  builder,
  command: 'handoff',
  describe: 'Run a handoff assistant to aide in moving to the next caretaker',
};
