/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** A regex to select a ref that matches our semver refs. */
const semverRegex = /^(\d+)\.(\d+)\.x$/;

/**
 * Sort a list of fullpath refs into a list and then provide the first entry.
 *
 * The sort order will first find primary branch ref, and then any semver ref, followed
 * by the rest of the refs in the order provided.
 *
 * Branches are sorted in this order as work is primarily done on one primary branch, and
 * otherwise on a semver branch. If neither of those were to match, the most
 * likely correct branch will be the first one encountered in the list.
 */
export function getRefFromBranchList(gitOutput: string, primaryBranchName: string): string {
  const branches = gitOutput.split(/\r?\n/g).map((b) => {
    // Omit the leading remote name. e.g. my_remote/fix/whatever -> fix/whatever.
    return b.split('/').slice(1).join('/').trim();
  });

  if (branches.length === 0) {
    throw new Error(`Could not find ref from branch list: ${gitOutput}`);
  }

  branches.sort((a: string, b: string) => {
    if (a === primaryBranchName) {
      return -1;
    }
    if (b === primaryBranchName) {
      return 1;
    }

    const aIsSemver = semverRegex.test(a);
    const bIsSemver = semverRegex.test(b);

    if (aIsSemver && bIsSemver) {
      const [, aMajor, aMinor] = a.match(semverRegex)!;
      const [, bMajor, bMinor] = b.match(semverRegex)!;
      return (
        parseInt(bMajor, 10) - parseInt(aMajor, 10) ||
        parseInt(aMinor, 10) - parseInt(bMinor, 10) ||
        0
      );
    }

    if (aIsSemver) {
      return -1;
    }
    if (bIsSemver) {
      return 1;
    }

    return 0;
  });

  return branches[0];
}
