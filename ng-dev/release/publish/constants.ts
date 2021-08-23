/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Project-relative path for the "package.json" file. */
export const packageJsonPath = 'package.json';

/** Project-relative path for the changelog file. */
export const changelogPath = 'CHANGELOG.md';

/** Default interval in milliseconds to check whether a pull request has been merged. */
export const waitForPullRequestInterval = 10000;

/**
 * Maximum number of characters a Github release entry can use for its body.  This number was
 * confirmed by reaching out to Github support to confirm the character limit.
 */
export const githubReleaseBodyLimit = 125000;
