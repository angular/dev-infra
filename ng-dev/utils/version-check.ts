/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as fs from 'fs';
import {workspaceRelativePackageJsonPath} from './constants.js';
import {Log} from './logging.js';
import {determineRepoBaseDirFromCwd} from './repo-directory.js';
import {Prompt} from './prompt.js';
import {ChildProcess} from './child-process.js';

/**
 * The currently executing version of ng-dev
 * Note: The placeholder will be replaced by the `pkg_npm` substitutions.
 */
export const localVersion = `0.0.0-{SCM_HEAD_SHA}`;

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
  const packageJsonPath = path.join(workspacePath, workspaceRelativePackageJsonPath);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  // If we are operating in the actual dev-infra repo, always return `true`.
  if (packageJson.name === '@angular/build-tooling') {
    Log.debug('Skipping ng-dev version check as this is a locally generated version.');
    return true;
  }
  const expectedVersion = await getExpectedVersionFromPnpm(workspacePath);

  Log.debug('Checking ng-dev version in lockfile and in the running script:');
  Log.debug(`  Local: ${localVersion}`);
  Log.debug(`  Expected: ${expectedVersion ?? 'unknown'}`);

  if (expectedVersion === null) {
    Log.warn('  ⚠   Could not extract the expected `ng-dev` version from `pnpm-lock.yaml`.');
    if (!process.stdin.isTTY) {
      return false;
    }
    try {
      return await Prompt.confirm({
        message: 'Do you want to continue anyway?',
        default: false,
      });
    } catch {
      return false;
    }
  }

  if (localVersion !== expectedVersion) {
    Log.warn('  ⚠   Your locally installed version of the `ng-dev` tool is outdated and not');
    Log.warn('      matching with the version in the `pnpm-lock.yaml` file.');
    Log.warn('      Re-install the dependencies to ensure you are using the correct version.');
    return false;
  }

  return true;
}

/** Retrieves the expected ng-dev version from the pnpm lockfile using `pnpm list`. */
async function getExpectedVersionFromPnpm(workspacePath: string): Promise<string | null> {
  try {
    const {stdout} = await ChildProcess.spawn(
      'pnpm',
      ['list', '@angular/ng-dev', '--json', '--lockfile-only'],
      {
        cwd: workspacePath,
        mode: 'silent',
        suppressErrorOnFailingExitCode: true,
      },
    );
    return extractNgDevVersionFromPnpmList(stdout);
  } catch (e) {
    Log.debug('Could not find expected ng-dev version from `pnpm list`:', e);
    return null;
  }
}

interface PnpmListProject {
  dependencies?: Record<string, {version: string}>;
  devDependencies?: Record<string, {version: string}>;
  optionalDependencies?: Record<string, {version: string}>;
}

/**
 * Extracts the expected `@angular/ng-dev` version from the JSON output of
 * `pnpm list "@angular/ng-dev" --json --lockfile-only`.
 */
export function extractNgDevVersionFromPnpmList(stdout: string): string | null {
  try {
    const projects = JSON.parse(stdout) as PnpmListProject[];
    if (!Array.isArray(projects)) {
      return null;
    }
    for (const project of projects) {
      const dep =
        project.dependencies?.['@angular/ng-dev'] ??
        project.devDependencies?.['@angular/ng-dev'] ??
        project.optionalDependencies?.['@angular/ng-dev'];
      if (dep?.version) {
        return dep.version;
      }
    }
  } catch {
    return null;
  }
  return null;
}
