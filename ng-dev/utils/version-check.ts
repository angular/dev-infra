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
import {ngDevNpmPackageName, workspaceRelativePackageJsonPath} from './constants.js';
import {Log} from './logging.js';
import {tryGetPackageId} from '@pnpm/dependency-path';
import {determineRepoBaseDirFromCwd} from './repo-directory.js';

/** Whether ngDevVersionMiddleware verification has already occured. */
let verified = false;
export async function ngDevVersionMiddleware() {
  // TODO(josephperrott): remove this guard against running multiple times after
  //   https://github.com/yargs/yargs/issues/2223 is fixed
  if (verified) {
    return;
  }
  // TODO(josephperrott): Create an enforcement configuration option.
  await verifyNgDevToolIsUpToDate(determineRepoBaseDirFromCwd());
  verified = true;
}

/**
 * Verifies that the `ng-dev` tool is up-to-date in the workspace. The check will compare
 * the local version of the tool against the requested version in the workspace lock file.
 *
 * This check is helpful ensuring that the caretaker does not accidentally run with an older
 * local version of `ng-dev` due to not running `yarn`/`pnpm` after checking out new revisions.
 *
 * @returns a boolean indicating success or failure.
 */
export async function verifyNgDevToolIsUpToDate(workspacePath: string): Promise<boolean> {
  // The placeholder will be replaced by the `pkg_npm` substitutions.
  const localVersion = `0.0.0-{SCM_HEAD_SHA}`;
  if (localVersion === ('0.0.0-{{BUILD_SCM_COMMIT_SHA}}' as string)) {
    Log.debug('Skipping ng-dev version check as this is a locally generated version.');
    return true;
  }
  const workspacePackageJsonFile = path.join(workspacePath, workspaceRelativePackageJsonPath);
  const pnpmLockFile = path.join(workspacePath, 'pnpm-lock.yaml');
  const yarnLockFile = path.join(workspacePath, 'yarn.lock');

  // TODO: Clean up this logic when fully dropping Yarn
  const isPnpmMigrated = fs.existsSync(pnpmLockFile) && !fs.existsSync(yarnLockFile);
  const expectedVersion = isPnpmMigrated
    ? getExpectedVersionFromPnpmLock(workspacePackageJsonFile, pnpmLockFile)
    : getExpectedVersionFromYarnLock(workspacePackageJsonFile, yarnLockFile);

  Log.debug('Checking ng-dev version in lockfile and in the running script:');
  Log.debug(`  Local: ${localVersion}`);
  Log.debug(`  Expected: ${expectedVersion}`);

  if (localVersion !== expectedVersion) {
    Log.warn('  ⚠   Your locally installed version of the `ng-dev` tool is outdated and not');
    Log.warn('      matching with the version in the `package.json` file.');
    Log.warn('      Re-install the dependencies to ensure you are using the correct version.');
    return false;
  }

  return true;
}

function getExpectedVersionFromYarnLock(workspacePackageJsonFile: string, lockFilePath: string) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(workspacePackageJsonFile, 'utf8')) as any;
    // If we are operating in the actual dev-infra repo, always return `true`.
    if (packageJson.name === ngDevNpmPackageName) {
      return true;
    }

    const lockFileContent = fs.readFileSync(lockFilePath, 'utf8');

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
    return lockFileObject[`${ngDevNpmPackageName}@${devInfraPkgVersion}`].version;
  } catch (e) {
    Log.debug('Could not find expected ng-dev version from `yarn.lock` file:', e);
    return null;
  }
}

function getExpectedVersionFromPnpmLock(workspacePackageJsonFile: string, lockFilePath: string) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(workspacePackageJsonFile, 'utf8')) as any;
    // If we are operating in the actual dev-infra repo, always return `true`.
    if (packageJson.name === ngDevNpmPackageName) {
      return true;
    }

    const lockFileContent = fs.readFileSync(lockFilePath, 'utf8');
    const lockFile = parseYaml(lockFileContent);
    const importers = lockFile['importers']['.'];
    const depEntry =
      importers.dependencies?.['@angular/ng-dev'] ??
      importers.devDependencies?.['@angular/ng-dev'] ??
      importers.optionalDependencies?.['@angular/ng-dev'];
    const packageId = tryGetPackageId(depEntry.version);

    return lockFile['packages'][`@angular/ng-dev@${packageId}`].version;
  } catch (e) {
    Log.debug('Could not find expected ng-dev version from `pnpm-lock.yaml` file:', e);
    return null;
  }
}
