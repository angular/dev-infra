/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as fs from 'fs';
import lockfile from '@yarnpkg/lockfile';
import {parse as parseYaml} from 'yaml';
import {
  ngDevNpmPackageName,
  workspaceRelativePackageJsonPath,
  workspaceRelativeYarnLockFilePath,
} from './constants.js';
import {Log} from './logging.js';

/**
 * Verifies that the `ng-dev` tool is up-to-date in the workspace. The check will compare
 * the local version of the tool against the requested version in the workspace lock file.
 *
 * This check is helpful ensuring that the caretaker does not accidentally run with an older
 * local version of `ng-dev` due to not running `yarn` after checking out new revisions.
 *
 * @returns a boolean indicating success or failure.
 */
export async function verifyNgDevToolIsUpToDate(workspacePath: string): Promise<boolean> {
  // The placeholder will be replaced by the `pkg_npm` substitutions.
  const localVersion = `0.0.0-{SCM_HEAD_SHA}`;
  const workspacePackageJsonFile = path.join(workspacePath, workspaceRelativePackageJsonPath);
  const workspaceDirLockFile = path.join(workspacePath, workspaceRelativeYarnLockFilePath);

  try {
    const packageJson = JSON.parse(fs.readFileSync(workspacePackageJsonFile, 'utf8')) as any;
    // If we are operating in the actual dev-infra repo, always return `true`.
    if (packageJson.name === ngDevNpmPackageName) {
      return true;
    }

    const lockFileContent = fs.readFileSync(workspaceDirLockFile, 'utf8');

    let lockFileObject: Record<string, {version: string}>;
    try {
      const lockFile = lockfile.parse(lockFileContent);

      if (lockFile.type !== 'success') {
        throw Error('Unable to parse workspace lock file. Please ensure the file is valid.');
      }
      lockFileObject = lockFile.object as lockfile.LockFileObject;
    } catch {
      lockFileObject = parseYaml(lockFileContent);
    }

    const devInfraPkgVersion =
      packageJson?.dependencies?.[ngDevNpmPackageName] ??
      packageJson?.devDependencies?.[ngDevNpmPackageName] ??
      packageJson?.optionalDependencies?.[ngDevNpmPackageName];
    const expectedVersion = lockFileObject[`${ngDevNpmPackageName}@${devInfraPkgVersion}`].version;

    if (localVersion !== expectedVersion) {
      Log.error('  ✘   Your locally installed version of the `ng-dev` tool is outdated and not');
      Log.error('      matching with the version in the `package.json` file.');
      Log.error('      Re-install the dependencies to ensure you are using the correct version.');
      return false;
    }
    return true;
  } catch (e) {
    Log.error(e);
    return false;
  }
}
