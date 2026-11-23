/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../../utils/git/git-client.js';

/** Zero-width and directional formatting characters ignored by HFS+/APFS path lookup. */
const IGNORABLE_PATH_CHARS_REGEX = /[\u200c-\u200f\u202a-\u202e\u206a-\u206f\ufeff]/g;

/** Matches `node_modules` and Windows 8.3 short-name equivalents (`NODE_M~1`, `NODEMO~1`). */
const NODE_MODULES_SEGMENT_REGEX = /^(node_modules|node_m~\d+|nodemo~\d+)$/i;

/** Error thrown when a pull request commit or tree contains files under `node_modules/`. */
export class ForbiddenPullRequestPathsError extends Error {
  constructor(public readonly forbiddenPaths: string[]) {
    super(
      `Pull request contains forbidden files under node_modules/: ${forbiddenPaths.join(', ')}`,
    );
  }
}

/** Error thrown when a fetched pull request branch head does not match the expected SHA. */
export class MismatchedFetchedHeadShaError extends Error {
  constructor(
    public readonly expectedSha: string,
    public readonly actualSha: string,
  ) {
    super(
      `Pull request head commit changed while fetching (expected ${expectedSha}, got ${actualSha}).`,
    );
  }
}

/**
 * Determines whether `filePath` traverses a `node_modules` directory segment across POSIX,
 * case-insensitive APFS/NTFS, and NTFS trailing-dot/space or 8.3 short-name rules.
 */
function hasNodeModulesSegment(filePath: string): boolean {
  return filePath.split(/[\\/]/).some((rawSegment) => {
    const normalized = rawSegment
      .normalize('NFC')
      .replace(IGNORABLE_PATH_CHARS_REGEX, '')
      .replace(/[ .]+$/, '');
    return normalized.length > 0 && NODE_MODULES_SEGMENT_REGEX.test(normalized);
  });
}

/** Filters NUL-delimited Git path output (`-z`) to unique paths inside `node_modules/`. */
export function extractNodeModulesPaths(gitNulPathsOutput: string): string[] {
  return Array.from(
    new Set(
      gitNulPathsOutput
        .split('\0')
        .filter((entry) => entry.length > 0 && hasNodeModulesSegment(entry)),
    ),
  );
}

/** Asserts that the tree of `revision` contains no files under `node_modules/`. */
export function assertNoNodeModulesInTree(git: GitClient, revision: string): void {
  const output = git.run(['ls-tree', '-r', '-z', '--name-only', revision]).stdout;
  const forbidden = extractNodeModulesPaths(output);
  if (forbidden.length > 0) {
    throw new ForbiddenPullRequestPathsError(forbidden);
  }
}

/**
 * Asserts that no commit in `revisionRange` adds, modifies, copies, or renames files into
 * `node_modules/` (permitting pure deletions via `--diff-filter=d`).
 */
export function assertNoNodeModulesInCommitRange(git: GitClient, revisionRange: string): void {
  const output = git.run([
    'log',
    '--no-show-signature',
    '--no-notes',
    '--no-renames',
    '--diff-filter=d',
    '-z',
    '-m',
    '--pretty=format:',
    '--name-only',
    revisionRange,
  ]).stdout;
  const forbidden = extractNodeModulesPaths(output);
  if (forbidden.length > 0) {
    throw new ForbiddenPullRequestPathsError(forbidden);
  }
}

/** Ensures `commitSha` exists locally, fetching `refName` from `fetchUrl` if missing. */
export function ensureBaseCommitExistsLocally(
  git: GitClient,
  commitSha: string,
  fetchUrl: string,
  refName: string,
): void {
  if (
    git.runGraceful(['cat-file', '-e', `${commitSha}^{commit}`], {stdio: 'ignore'}).status === 0
  ) {
    return;
  }

  git.run(['fetch', '-q', fetchUrl, '--deepen=500', '--', refName]);

  if (
    git.runGraceful(['cat-file', '-e', `${commitSha}^{commit}`], {stdio: 'ignore'}).status !== 0
  ) {
    git.runGraceful(['fetch', '-q', fetchUrl, '--depth=1', '--', commitSha], {stdio: 'ignore'});
  }
}
