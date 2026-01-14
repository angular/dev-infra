/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {getCurrentMergeMode, MergeMode} from '../../utils/git/repository-merge-mode.js';
import {bold, Log} from '../../utils/logging.js';
import {BaseModule} from './base.js';

export class RepoStatusModule extends BaseModule<{mergeMode: MergeMode}> {
  override async retrieveData() {
    return {
      mergeMode: await getCurrentMergeMode(),
    };
  }

  override async printToTerminal() {
    const data = await this.data;
    Log.info(bold('Current Repository Settings'));
    Log.info(`Merge mode: ${bold(data.mergeMode)}`);
    Log.info();
  }
}
