/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as fs from 'fs';
import {parseAllDocuments} from 'yaml';
import {workspaceRelativePackageJsonPath} from './constants.js';
import {Log} from './logging.js';
import {tryGetPackageId} from '@pnpm/dependency-path';
import {determineRepoBaseDirFromCwd} from './repo-directory.js';
import {GitClient} from './git/git-client.js';
import {Prompt} from './prompt.js';

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
  const expectedVersion = await getExpectedVersionFromPnpmLockUpstream();

  Log.debug('Checking ng-dev version in lockfile and in the running script:');
  Log.debug(`  Local: ${localVersion}`);
  Log.debug(`  Expected: ${expectedVersion ?? 'unknown'}`);

  if (expectedVersion === null) {
    Log.warn('  ⚠   Could not extract the expected `ng-dev` version from `pnpm-lock.yaml`.');
    return await Prompt.confirm({
      message: 'Do you want to continue anyway?',
      default: false,
    });
  }

  if (localVersion !== expectedVersion) {
    Log.warn('  ⚠   Your locally installed version of the `ng-dev` tool is outdated and not');
    Log.warn('      matching with the version in the `package.json` file.');
    Log.warn('      Re-install the dependencies to ensure you are using the correct version.');
    return false;
  }

  return true;
}

/** Retrieves the pnpm lock file from upstream on the primary branch and extracts the version. */
async function getExpectedVersionFromPnpmLockUpstream(): Promise<string | null> {
  const git = await GitClient.get();
  try {
    const {data} = await git.github.repos.getContent({
      repo: git.remoteConfig.name,
      owner: git.remoteConfig.owner,
      ref: git.remoteConfig.mainBranchName,
      // This media type ensures requested files come back as the raw content.
      mediaType: {format: 'application/vnd.github.raw+json'},
      path: 'pnpm-lock.yaml',
    });
    if (Array.isArray(data) || data.type !== 'file') {
      throw Error(
        `A non-single file of content was retrieved from Github when the pnpm-lock.yaml file was requested`,
      );
    }
    const content = Buffer.from(data.content, data.encoding as BufferEncoding).toString('utf-8');
    const expectedVersion = extractNgDevVersionFromPnpmLock(content);
    if (expectedVersion === null) {
      throw Error('Could not find @angular/ng-dev entry in pnpm-lock.yaml');
    }

    return expectedVersion;
  } catch (e) {
    Log.debug('Could not find expected ng-dev version from `pnpm-lock.yaml` file:', e);
    return null;
  }
}

/**
 * Extracts the expected `@angular/ng-dev` version from the content of a `pnpm-lock.yaml` file.
 * Supports both single-document and multi-document YAML formats.
 */
export function extractNgDevVersionFromPnpmLock(content: string): string | null {
  const documents = parseAllDocuments(content);
  for (const doc of documents) {
    if (doc.errors.length > 0) {
      throw doc.errors[0];
    }
  }

  const lockFiles = documents.map((doc) => doc.toJS());

  for (const lockFile of lockFiles) {
    const importers = lockFile?.['importers']?.['.'];
    const depEntry =
      importers?.dependencies?.['@angular/ng-dev'] ??
      importers?.devDependencies?.['@angular/ng-dev'] ??
      importers?.optionalDependencies?.['@angular/ng-dev'];
    if (!depEntry) {
      continue;
    }
    const depEntryVersion =
      typeof depEntry === 'object' && depEntry !== null ? depEntry.version : depEntry;
    if (typeof depEntryVersion !== 'string' || !depEntryVersion) {
      continue;
    }
    const packageId = tryGetPackageId(depEntryVersion as any) ?? depEntryVersion;

    for (const file of lockFiles) {
      const version =
        file?.['packages']?.[`@angular/ng-dev@${packageId}`]?.version ??
        file?.['packages']?.[`@angular/ng-dev@${depEntryVersion}`]?.version;
      if (version) {
        return version;
      }
    }
  }

  return null;
}
