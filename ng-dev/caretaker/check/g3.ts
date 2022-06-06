/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, readFileSync} from 'fs';
import multimatch from 'multimatch';
import {join} from 'path';
import {parse as parseYaml} from 'yaml';
import {bold, Log} from '../../utils/logging';

import {BaseModule} from './base';

/** Information expressing the difference between the main and g3 branches */
export interface G3StatsData {
  insertions: number;
  deletions: number;
  files: number;
  commits: number;
}

export class G3Module extends BaseModule<G3StatsData | void> {
  override async retrieveData() {
    const toCopyToG3 = this.getG3FileIncludeAndExcludeLists();
    const latestSha = this.getLatestShas();

    if (toCopyToG3 === null || latestSha === null) {
      return;
    }

    return this.getDiffStats(latestSha.g3, latestSha.main, toCopyToG3.include, toCopyToG3.exclude);
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
  private getDiffStats(
    g3Ref: string,
    mainRef: string,
    includeFiles: string[],
    excludeFiles: string[],
  ) {
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
    this.git
      .run(['diff', `${g3Ref}...${mainRef}`, '--numstat'])
      .stdout // Remove the extra space after git's output.
      .trim()
      // Split each line of git output into array
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
        if (this.checkMatchAgainstIncludeAndExclude(fileName, includeFiles, excludeFiles)) {
          stats.insertions += insertions;
          stats.deletions += deletions;
          stats.files += 1;
        }
      });
    return stats;
  }
  /** Determine whether the file name passes both include and exclude checks. */
  private checkMatchAgainstIncludeAndExclude(file: string, includes: string[], excludes: string[]) {
    return (
      multimatch.call(undefined, file, includes).length >= 1 &&
      multimatch.call(undefined, file, excludes).length === 0
    );
  }

  private getG3FileIncludeAndExcludeLists() {
    const angularRobotFilePath = join(this.git.baseDir, '.github/angular-robot.yml');
    if (!existsSync(angularRobotFilePath)) {
      Log.debug('No angular robot configuration file exists, skipping.');
      return null;
    }
    /** The configuration defined for the angular robot. */
    const robotConfig = parseYaml(readFileSync(angularRobotFilePath).toString());
    /** The files to be included in the g3 sync. */
    const include: string[] = robotConfig?.merge?.g3Status?.include || [];
    /** The files to be expected in the g3 sync. */
    const exclude: string[] = robotConfig?.merge?.g3Status?.exclude || [];

    if (include.length === 0 && exclude.length === 0) {
      Log.debug(
        'No g3Status include or exclude lists are defined in the angular robot configuration',
      );
      return null;
    }

    return {include, exclude};
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
