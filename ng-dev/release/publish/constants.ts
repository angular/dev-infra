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
 * Maximum number of characters a Github release entry can use for its body.
 *
 * Note: Github does not specify an official limit for this, but based on local testing,
 * Github limits switch between 25000 and 125000 characters. We use the lowest limit we have
 * seen so far, as otherwise the limit can potentially be wrong and result in errors.
 */
export const githubReleaseBodyLimit = 25000;
