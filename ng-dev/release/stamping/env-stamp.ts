/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';

import {GitClient} from '../../utils/git/git-client.js';
import semver from 'semver';
import {createExperimentalSemver} from '../../release/versioning/experimental-versions.js';
import {join} from 'path';

export type EnvStampMode = 'snapshot' | 'release';

/** Log the environment variables expected by Bazel for stamping. */
export function buildEnvStamp(mode: EnvStampMode, includeVersion: boolean) {
  const git = GitClient.get();

  console.info(`BUILD_SCM_BRANCH ${getCurrentBranch(git)}`);
  console.info(`BUILD_SCM_COMMIT_SHA ${getCurrentSha(git)}`);
  console.info(`BUILD_SCM_HASH ${getCurrentSha(git)}`);
  console.info(`BUILD_SCM_ABBREV_HASH ${getCurrentAbbrevSha(git)}`);
  console.info(`BUILD_SCM_BRANCH ${getCurrentBranchOrRevision(git)}`);
  console.info(`BUILD_SCM_LOCAL_CHANGES ${hasLocalChanges(git)}`);
  console.info(`BUILD_SCM_USER ${getCurrentGitUser(git)}`);

  if (includeVersion === true) {
    const {version, experimentalVersion} = getSCMVersions(git, mode);
    console.info(`BUILD_SCM_VERSION ${version}`);
    console.info(`BUILD_SCM_EXPERIMENTAL_VERSION ${experimentalVersion}`);
  }

  process.exit();
}

/** Whether the repo has local changes. */
function hasLocalChanges(git: GitClient) {
  try {
    return git.hasUncommittedChanges();
  } catch {
    return true;
  }
}

/**
 * Get the versions for generated packages. The stamped versions are always based
 * on the workspace version. Relying on tags is less reliable because tags can be
 * modified easily in an untracked/uncontrolled way, and are less predictable with
 * regards to the source control revision currently being checked out.
 *
 * A concrete use-case: The release tool tags the versioning commit only after building
 * and publishing to NPM, causing snapshot-docs deployment to display versions from
 * a previous version because the CI push for the bump commits executes earlier.
 *
 * In snapshot mode, we will include the current SHA along with the workspace version.
 */
function getSCMVersions(
  git: GitClient,
  mode: EnvStampMode,
): {version: string; experimentalVersion: string} {
  const version = getVersionFromWorkspacePackageJson(git).format();
  const experimentalVersion = createExperimentalSemver(version).format();

  if (mode === 'release') {
    return {
      version,
      experimentalVersion,
    };
  }

  const headShaAbbreviated = getCurrentSha(git).slice(0, 7);
  const localChanges = hasLocalChanges(git) ? '-with-local-changes' : '';

  return {
    version: `${version}+sha-${headShaAbbreviated}${localChanges}`,
    experimentalVersion: `${experimentalVersion}+sha-${headShaAbbreviated}${localChanges}`,
  };
}

/** Get the current SHA of HEAD. */
function getCurrentSha(git: GitClient) {
  try {
    return git.run(['rev-parse', 'HEAD']).stdout.trim();
  } catch {
    return '';
  }
}

/** Get the current abbreviated SHA of HEAD. */
function getCurrentAbbrevSha(git: GitClient) {
  try {
    return git.run(['rev-parse', '--short', 'HEAD']).stdout.trim();
  } catch {
    return '';
  }
}

/** Get the current branch or revision of HEAD. */
function getCurrentBranchOrRevision(git: GitClient) {
  try {
    return git.getCurrentBranchOrRevision();
  } catch {
    return '';
  }
}

/** Get the currently checked out branch. */
function getCurrentBranch(git: GitClient) {
  try {
    return git.run(['symbolic-ref', '--short', 'HEAD']).stdout.trim();
  } catch {
    return '';
  }
}

/** Get the current git user based on the git config. */
function getCurrentGitUser(git: GitClient) {
  try {
    let userName = git.runGraceful(['config', 'user.name']).stdout.trim() || 'Unknown User';
    let userEmail = git.runGraceful(['config', 'user.email']).stdout.trim() || 'unknown_email';
    return `${userName} <${userEmail}>`;
  } catch {
    return '';
  }
}

/** Gets the `version` from the workspace top-level `package.json` file. */
function getVersionFromWorkspacePackageJson(git: GitClient): semver.SemVer {
  const packageJsonPath = join(git.baseDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
    version: string | undefined;
  };

  if (packageJson.version === undefined) {
    throw new Error(`No workspace version found in: ${packageJsonPath}`);
  }

  return new semver.SemVer(packageJson.version);
}
