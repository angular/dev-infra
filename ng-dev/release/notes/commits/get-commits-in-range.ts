/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../../utils/git/git-client.js';
import {
  CommitFromGitLog,
  gitLogFormatForParsing,
  parseCommitFromGitLog,
} from '../../../commit-message/parse.js';
import {computeUniqueIdFromCommitMessage} from './unique-commit-id.js';

/**
 * Gets all commits the head branch contains, but the base branch does not include.
 * This follows the same semantics as Git's double-dot revision range.
 *
 * i.e. `<baseRef>..<headRef>` revision range as per Git.
 * https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection.
 *
 * Branches in the Angular organization are diverging quickly due to multiple factors
 * concerning the versioning and merging. i.e. Commits are cherry-picked into branches,
 * resulting in different SHAs for each branch. Additionally, branches diverge quickly
 * because changes can be made only for specific branches (e.g. a master-only change).
 *
 * In order to allow for comparisons that follow similar semantics as Git's double-dot
 * revision range syntax, the logic re-implementing the semantics need to account for
 * the mentioned semi-diverged branches. We achieve this by excluding commits in the
 * head branch which have a similarly-named commit in the base branch. We cannot rely on
 * SHAs for determining common commits between the two branches (as explained above).
 *
 * More details can be found in the `get-commits-in-range.png` file which illustrates a
 * scenario where commits from the patch branch need to be excluded from the main branch.
 */
export function getCommitsForRangeWithDeduping(
  client: GitClient,
  baseRef: string,
  headRef: string,
): CommitFromGitLog[] {
  const commits: CommitFromGitLog[] = [];
  const commitsForHead = fetchCommitsForRevisionRange(client, `${baseRef}..${headRef}`);
  const commitsForBase = fetchCommitsForRevisionRange(client, `${headRef}..${baseRef}`);

  // Map that keeps track of commits within the base branch. Commits are
  // stored with an unique id based on the commit message. If a similarly-named
  // commit appears multiple times, the value number will reflect that.
  const knownCommitsOnlyInBase = new Map<string, number>();

  for (const commit of commitsForBase) {
    const id = computeUniqueIdFromCommitMessage(commit);
    const numSimilarCommits = knownCommitsOnlyInBase.get(id) ?? 0;
    knownCommitsOnlyInBase.set(id, numSimilarCommits + 1);
  }

  for (const commit of commitsForHead) {
    const id = computeUniqueIdFromCommitMessage(commit);
    const numSimilarCommits = knownCommitsOnlyInBase.get(id) ?? 0;

    // If there is a similar commit in the base branch, the current commit in the head branch
    // needs to be skipped. We keep track of the number of similar commits so that we do not
    // accidentally "dedupe" a commit. e.g. consider a case where commit `X` lands in the
    // patch branch and next branch. Then a similar similarly named commits lands only in the
    // next branch. We would not want to omit that one as it is not part of the patch branch.
    if (numSimilarCommits > 0) {
      knownCommitsOnlyInBase.set(id, numSimilarCommits - 1);
      continue;
    }

    commits.push(commit);
  }

  return commits;
}

/** Fetches commits for the given revision range using `git log`. */
export function fetchCommitsForRevisionRange(
  client: GitClient,
  revisionRange: string,
): CommitFromGitLog[] {
  const splitDelimiter = '-------------ɵɵ------------';
  const output = client.run([
    'log',
    `--format=${gitLogFormatForParsing}${splitDelimiter}`,
    revisionRange,
  ]);

  return output.stdout
    .split(splitDelimiter)
    .filter((entry) => !!entry.trim())
    .map((entry) => parseCommitFromGitLog(Buffer.from(entry, 'utf-8')));
}
