/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {green, Log} from '../../utils/logging.js';
import {Commit} from '../parse.js';
import {getCommitsInRange} from '../utils.js';
import {
  printValidationErrors,
  validateCommitMessage,
  ValidateCommitMessageOptions,
} from '../validate.js';

// Whether the provided commit is a fixup commit.
const isNonFixup = (commit: Commit) => !commit.isFixup;

// Extracts commit header (first line of commit message).
const extractCommitHeader = (commit: Commit) => commit.header;

/** Validate all commits in a provided git commit range. */
export async function validateCommitRange(from: string, to: string): Promise<void> {
  /** A list of tuples of the commit header string and a list of error messages for the commit. */
  const errors: [commitHeader: string, errors: string[]][] = [];

  /** A list of parsed commit messages from the range. */
  const commits = await getCommitsInRange(from, to);
  Log.info(`Examining ${commits.length} commit(s) in the provided range: ${from}..${to}`);

  /**
   * Whether all commits in the range are valid, commits are allowed to be fixup commits for other
   * commits in the provided commit range.
   */
  let allCommitsInRangeValid = true;

  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i];
    const options: ValidateCommitMessageOptions = {
      disallowSquash: true,
      nonFixupCommitHeaders: isNonFixup(commit)
        ? undefined
        : commits
            .slice(i + 1)
            .filter(isNonFixup)
            .map(extractCommitHeader),
    };

    const {valid, errors: localErrors} = await validateCommitMessage(commit, options);
    if (localErrors.length) {
      errors.push([commit.header, localErrors]);
    }

    allCommitsInRangeValid = allCommitsInRangeValid && valid;
  }

  if (allCommitsInRangeValid) {
    Log.info(green('√  All commit messages in range valid.'));
  } else {
    Log.error('✘  Invalid commit message');
    errors.forEach(([header, validationErrors]) => {
      Log.error.group(header);
      printValidationErrors(validationErrors);
      Log.error.groupEnd();
    });
    // Exit with a non-zero exit code if invalid commit messages have
    // been discovered.
    process.exit(1);
  }
}
