/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';
import {Log} from '../../utils/logging';
import {addGithubTokenOption} from '../../utils/git/github-yargs';
import {setMergeModeRelease} from './release';
import {resetMergeMode} from './reset';
import {getCurrentMergeMode} from '../../utils/git/repository-merge-mode';

interface Options {
  mode?: string;
}

async function setMergeModeBuilder(argv: Argv): Promise<Argv<Options>> {
  return addGithubTokenOption(argv).positional('mode', {
    type: 'string',
    choices: ['release', 'reset'],
  });
}

async function setMergeModeHandler({mode}: Arguments<Options>) {
  if (mode === undefined) {
    const currentMode = await getCurrentMergeMode();
    Log.info(`Repository merge-mode is currently set to: ${currentMode}`);
    return;
  }
  if (mode === 'reset') {
    return await resetMergeMode();
  }
  if (mode === 'release') {
    return await setMergeModeRelease();
  }
  Log.error(`Unable to set the merge mode to the provided mode: ${mode}`);
}

export const MergeModeModule: CommandModule<{}, {}> = {
  builder: setMergeModeBuilder,
  handler: setMergeModeHandler,
  command: ['merge-mode [mode]'],
  describe: 'Set the repository merge mode',
};
