/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {SemVer} from 'semver';
import {GitClient} from '../../utils/git/git-client';
import {createExperimentalSemver} from '../../release/versioning/experimental-versions';
import * as fs from 'fs';

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
 * Get the versions for generated packages.
 *
 * In snapshot mode, the version is based on the most recent semver tag.
 * In release mode, the version is based on the workspace version.
 */
function getSCMVersions(
  git: GitClient,
  mode: EnvStampMode,
): {version: string; experimentalVersion: string} {
  if (mode === 'release') {
    const workspaceVersion = getVersionFromWorkspacePackageJson(git);

    return {
      version: workspaceVersion.format(),
      experimentalVersion: createExperimentalSemver(workspaceVersion).format(),
    };
  }

  const localChanges = hasLocalChanges(git) ? '.with-local-changes' : '';
  const {stdout: rawVersion} = git.run([
    'describe',
    '--match',
    // As git describe uses glob matchers we cannot the specific describe what we expect to see
    // starting character we expect for our version string.  To ensure we can handle 'v'
    // prefixed verstions we have the '?' wildcard character.
    '?[0-9]*.[0-9]*.[0-9]*',
    '--abbrev=7',
    '--tags',
    'HEAD',
  ]);
  const {version} = new SemVer(rawVersion);
  const {version: experimentalVersion} = createExperimentalSemver(version);
  return {
    version: `${version.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
    experimentalVersion: `${experimentalVersion.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
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
function getVersionFromWorkspacePackageJson(git: GitClient): SemVer {
  const packageJsonPath = join(git.baseDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
    version: string | undefined;
  };

  if (packageJson.version === undefined) {
    throw new Error(`No workspace version found in: ${packageJsonPath}`);
  }

  return new SemVer(packageJson.version);
}
