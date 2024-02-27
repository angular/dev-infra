/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, Log} from '../../utils/logging.js';
import {G3StatsData, G3Stats} from '../../utils/g3.js';

import {BaseModule} from './base.js';

export class G3Module extends BaseModule<G3StatsData | void> {
  override async retrieveData() {
    return await G3Stats.retrieveDiffStats(this.git, this.config);
  }

  override async printToTerminal() {
    const stats = await this.data;
    if (!stats) {
      return;
    }
    Log.info.group(bold('g3 branch check'));
    if (stats.files === 0 && stats.separateFiles === 0) {
      Log.info(`${stats.commits} commits between g3 and ${this.git.mainBranchName}`);
      Log.info('✅  No sync is needed at this time');
    } else if (stats.separateFiles > 0) {
      Log.info(
        `${stats.separateFiles} primitives files changed, ${stats.files} Angular files changed, ` +
          `${stats.insertions} insertions(+), ${stats.deletions} deletions(-) from ` +
          `${stats.commits} commits will be included in the next sync\n` +
          `Note: Shared primivites code has been merged. Only more Shared Primitives code can be ` +
          `merged until the next sync is landed`,
      );
    } else {
      Log.info(
        `${stats.files} files changed, ${stats.insertions} insertions(+), ${stats.deletions} ` +
          `deletions(-) from ${stats.commits} commits will be included in the next sync`,
      );
    }
    Log.info.groupEnd();
    Log.info();
  }
}
