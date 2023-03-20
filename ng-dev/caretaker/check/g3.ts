/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, Log} from '../../utils/logging.js';
import {readConfigFile, SyncFileMatchFn} from '../g3-sync-config.js';
import path from 'path';

import {BaseModule} from './base.js';

/** Information expressing the difference between the main and g3 branches */
export interface G3StatsData {
  insertions: number;
  deletions: number;
  files: number;
  commits: number;
}

export class G3Module extends BaseModule<G3StatsData | void> {
  override async retrieveData() {
    const syncFileMatchFn = await this.getG3SyncFileMatchFn();
    const latestSha = this.getLatestShas();

    if (syncFileMatchFn === null || latestSha === null) {
      return;
    }

    return this.getDiffStats(latestSha.g3, latestSha.main, syncFileMatchFn);
  }

  override async printToTerminal() {
    const stats = await this.data;
    if (!stats) {
      return;
    }
    Log.info.group(bold('g3 branch check'));
    if (stats.files === 0) {
      Log.info(`${stats.commits} commits between g3 and ${this.git.mainBranchName}`);
      Log.info('✅  No sync is needed at this time');
    } else {
      Log.info(
        `${stats.files} files changed, ${stats.insertions} insertions(+), ${stats.deletions} ` +
          `deletions(-) from ${stats.commits} commits will be included in the next sync`,
      );
    }
    Log.info.groupEnd();
    Log.info();
  }

  /** Fetch and retrieve the latest sha for a specific branch. */
  private getShaForBranchLatest(branch: string) {
    // With the --exit-code flag, if no match is found an exit code of 2 is returned by the command.
    if (
      this.git.runGraceful(['ls-remote', '--exit-code', this.git.getRepoGitUrl(), branch])
        .status === 2
    ) {
      Log.debug(`No '${branch}' branch exists on upstream, skipping.`);
      return null;
    }

    // Retrieve the latest ref for the branch and return its sha.
    this.git.runGraceful(['fetch', '-q', this.git.getRepoGitUrl(), branch]);
    return this.git.runGraceful(['rev-parse', 'FETCH_HEAD']).stdout.trim();
  }

  /**
   * Get git diff stats between main and g3, for all files and filtered to only g3 affecting
   * files.
   */
  private getDiffStats(g3Ref: string, mainRef: string, syncFileMatchFn: SyncFileMatchFn) {
    /** The diff stats to be returned. */
    const stats = {
      insertions: 0,
      deletions: 0,
      files: 0,
      commits: 0,
    };

    // Determine the number of commits between main and g3 refs. */
    stats.commits = parseInt(
      this.git.run(['rev-list', '--count', `${g3Ref}..${mainRef}`]).stdout,
      10,
    );

    // Get the numstat information between main and g3
    const numStatDiff = this.git
      .run(['diff', `${g3Ref}...${mainRef}`, '--numstat'])
      .stdout // Remove the extra space after git's output.
      .trim();

    // If there is no diff, we can return early.
    if (numStatDiff === '') {
      return stats;
    }

    // Split each line of git output into array
    numStatDiff
      .split('\n')
      // Split each line from the git output into components parts: insertions,
      // deletions and file name respectively
      .map((line) => line.trim().split('\t'))
      // Parse number value from the insertions and deletions values
      // Example raw line input:
      //   10\t5\tsrc/file/name.ts
      .map((line) => [Number(line[0]), Number(line[1]), line[2]] as [number, number, string])
      // Add each line's value to the diff stats, and conditionally to the g3
      // stats as well if the file name is included in the files synced to g3.
      .forEach(([insertions, deletions, fileName]) => {
        if (syncFileMatchFn(fileName)) {
          stats.insertions += insertions;
          stats.deletions += deletions;
          stats.files += 1;
        }
      });

    return stats;
  }

  private async getG3SyncFileMatchFn(): Promise<null | SyncFileMatchFn> {
    if (this.config.caretaker.g3SyncConfigPath === undefined) {
      Log.debug('No Google Sync configuration specified.');
      return null;
    }

    const configPath = path.join(this.git.baseDir, this.config.caretaker.g3SyncConfigPath);
    const {matchFn, config} = await readConfigFile(configPath);
    if (config.syncedFilePatterns.length === 0) {
      Log.warn('Google Sync configuration does not specify any files being synced.');
    }
    return matchFn;
  }

  private getLatestShas() {
    /** The latest sha for the g3 branch. */
    const g3 = this.getShaForBranchLatest('g3');
    /** The latest sha for the main branch. */
    const main = this.getShaForBranchLatest(this.git.mainBranchName);

    if (g3 === null || main === null) {
      Log.debug(`Either the g3 or ${this.git.mainBranchName} was unable to be retrieved`);
      return null;
    }

    return {g3, main};
  }
}
