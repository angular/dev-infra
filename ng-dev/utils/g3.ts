/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import path from 'path';
import {Log} from './logging.js';
import {CaretakerConfig, GithubConfig, SyncFileMatchFn, getGoogleSyncConfig} from './config.js';
import {AuthenticatedGitClient} from './git/authenticated-git-client.js';

/** Information expressing the difference between the main and g3 branches */
export interface G3StatsData {
  insertions: number;
  deletions: number;
  files: number;
  primitivesFiles: number;
  commits: number;
}

export class G3Stats {
  static async retrieveDiffStats(
    git: AuthenticatedGitClient,
    config: {caretaker: CaretakerConfig; github: GithubConfig},
  ): Promise<G3StatsData | undefined> {
    const syncMatchFns = await this.getG3SyncFileMatchFns(git, config);
    const latestSha = this.getLatestShas(git);

    if (
      syncMatchFns === null ||
      syncMatchFns.ngMatchFn === null ||
      syncMatchFns.primitivesMatchFn === null ||
      latestSha === null
    ) {
      return;
    }

    return this.getDiffStats(git, latestSha.g3, latestSha.main, syncMatchFns);
  }

  /**
   * Get git diff stats between main and g3, for all files and filtered to only g3 affecting
   * files.
   */
  static getDiffStats(
    git: AuthenticatedGitClient,
    g3Ref: string,
    mainRef: string,
    syncMatchFns: {ngMatchFn: SyncFileMatchFn; primitivesMatchFn: SyncFileMatchFn},
  ): G3StatsData {
    /** The diff stats to be returned. */
    const stats = {
      insertions: 0,
      deletions: 0,
      files: 0,
      primitivesFiles: 0,
      commits: 0,
    };

    // Determine the number of commits between main and g3 refs. */
    stats.commits = parseInt(git.run(['rev-list', '--count', `${g3Ref}..${mainRef}`]).stdout, 10);

    // Get the numstat information between main and g3
    const numStatDiff = git
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
        if (syncMatchFns.ngMatchFn(fileName)) {
          stats.insertions += insertions;
          stats.deletions += deletions;
          stats.files += 1;
        } else if (syncMatchFns.primitivesMatchFn(fileName)) {
          stats.insertions += insertions;
          stats.deletions += deletions;
          stats.primitivesFiles += 1;
        }
      });

    return stats;
  }

  /** Fetch and retrieve the latest sha for a specific branch. */
  static getShaForBranchLatest(git: AuthenticatedGitClient, branch: string) {
    // With the --exit-code flag, if no match is found an exit code of 2 is returned by the command.
    if (git.runGraceful(['ls-remote', '--exit-code', git.getRepoGitUrl(), branch]).status === 2) {
      Log.debug(`No '${branch}' branch exists on upstream, skipping.`);
      return null;
    }

    // Retrieve the latest ref for the branch and return its sha.
    git.runGraceful(['fetch', '-q', git.getRepoGitUrl(), branch]);
    return git.runGraceful(['rev-parse', 'FETCH_HEAD']).stdout.trim();
  }

  static async getG3SyncFileMatchFns(
    git: AuthenticatedGitClient,
    configs: {caretaker: CaretakerConfig; github: GithubConfig},
  ): Promise<null | {
    ngMatchFn: SyncFileMatchFn;
    primitivesMatchFn: SyncFileMatchFn;
  }> {
    if (configs.caretaker.g3SyncConfigPath === undefined) {
      Log.debug('No Google Sync configuration specified.');
      return null;
    }

    const configPath = path.join(git.baseDir, configs.caretaker.g3SyncConfigPath);
    const {ngMatchFn, primitivesMatchFn, config} = await getGoogleSyncConfig(configPath);
    if (config.syncedFilePatterns.length === 0) {
      Log.warn('Google Sync configuration does not specify any files being synced.');
    }
    return {ngMatchFn, primitivesMatchFn};
  }

  static getLatestShas(git: AuthenticatedGitClient) {
    /** The latest sha for the g3 branch. */
    const g3 = this.getShaForBranchLatest(git, 'g3');
    /** The latest sha for the main branch. */
    const main = this.getShaForBranchLatest(git, git.mainBranchName);

    if (g3 === null || main === null) {
      Log.debug(`Either the g3 or ${git.mainBranchName} was unable to be retrieved`);
      return null;
    }

    return {g3, main};
  }
}
