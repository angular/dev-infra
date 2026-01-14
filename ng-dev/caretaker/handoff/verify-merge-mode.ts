/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, green, Log, red} from '../../utils/logging';
import {Prompt} from '../../utils/prompt';
import {
  getCurrentMergeMode,
  MergeMode,
  setRepoMergeMode,
} from '../../utils/git/repository-merge-mode';

export async function verifyMergeMode(expectedMode: MergeMode): Promise<boolean> {
  const mode = await getCurrentMergeMode();
  if (mode === expectedMode) {
    return true;
  }

  Log.info(`The repository merge-mode is currently ${bold(mode)} and must be reset before handoff`);
  if (
    await Prompt.confirm({
      message: `Would you like to reset this to ${expectedMode}`,
      default: true,
    })
  ) {
    try {
      await setRepoMergeMode(expectedMode);
      Log.info(`${green('✔')} Successfuly set merge-mode to ${expectedMode}`);
      return true;
    } catch (err) {
      Log.info(`${red('✘')} Failed to update merge-mode`);
      Log.info(err);
      return false;
    }
  }
  // User chose not to reset merge-mode
  Log.info('Aborting...');
  return false;
}
