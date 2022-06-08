/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../utils/git/git-client.js';

/** Finds a non-reserved branch name in the repository with respect to a base name. */
export function findAvailableLocalBranchName(git: GitClient, baseName: string): string {
  let currentName = baseName;
  let suffixNum = 0;

  while (hasLocalBranch(git, currentName)) {
    suffixNum++;
    currentName = `${baseName}_${suffixNum}`;
  }

  return currentName;
}

/** Gets whether the given branch exists locally. */
export function hasLocalBranch(git: GitClient, branchName: string): boolean {
  return git.runGraceful(['rev-parse', `refs/heads/${branchName}`], {stdio: 'ignore'}).status === 0;
}

/** Gets the current branch name. */
export function getCurrentBranch(git: GitClient): string {
  return git.run(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
}
