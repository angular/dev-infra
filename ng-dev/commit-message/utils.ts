/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '@conventional-changelog/git-client';
import {determineRepoBaseDirFromCwd} from '../utils/repo-directory';
import {CommitFromGitLog, gitLogFormatForParsing, parseCommitFromGitLog} from './parse.js';

/** The singleton instance of the GitClient, instantiated lazily. */
let gitClient: GitClient;

/**
 * Find all commits within the given range and return an object describing those.
 */
export async function getCommitsInRange(
  from: string,
  to: string = 'HEAD',
): Promise<CommitFromGitLog[]> {
  gitClient ??= new GitClient(determineRepoBaseDirFromCwd());

  const commits: CommitFromGitLog[] = [];

  for await (const commit of gitClient.getRawCommits({from, to, format: gitLogFormatForParsing})) {
    commits.push(parseCommitFromGitLog(commit));
  }

  return commits;
}
