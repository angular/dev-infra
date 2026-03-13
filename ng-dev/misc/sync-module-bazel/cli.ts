/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, CommandModule} from 'yargs';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {determineRepoBaseDirFromCwd} from '../../utils/repo-directory';
import {PackageJson, syncNodeJs, syncPnpm, syncTypeScript} from './sync-module-bazel';
import {ChildProcess} from '../../utils/child-process';
import {formatFiles} from '../../format/format';
import {getBazelBin} from '../../utils/bazel-bin';

async function builder(argv: Argv) {
  return argv;
}

async function handler() {
  // TODO: Implement a marker-based root discovery (e.g., .ng-secondary-base).
  // This should traverse upward to find the secondary base before falling back to `git rev-parse --show-toplevel`.
  // Necessary to support non-standard repository structures where workflows are triggered outside the traditional rootDir.
  const rootDir = process.cwd();
  const packageJsonPath = join(rootDir, 'package.json');
  const moduleBazelPath = join(rootDir, 'MODULE.bazel');
  let nvmrcPath = join(rootDir, '.nvmrc');
  if (!existsSync(nvmrcPath)) {
    nvmrcPath = join(determineRepoBaseDirFromCwd(), '.nvmrc');
  }

  // Read package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson;
  const pnpmVersion = packageJson.engines?.pnpm;
  const tsVersion = packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript;

  // Read .nvmrc
  let nvmrcVersion: string | undefined;
  try {
    nvmrcVersion = readFileSync(nvmrcPath, 'utf8').trim().replace(/^v/, '');
  } catch {
    // .nvmrc is optional.
  }

  // Read MODULE.bazel
  const originalBazelContent = readFileSync(moduleBazelPath, 'utf8');
  let moduleBazelContent = originalBazelContent;

  if (pnpmVersion) {
    moduleBazelContent = await syncPnpm(moduleBazelContent, pnpmVersion);
  }

  if (tsVersion) {
    moduleBazelContent = await syncTypeScript(moduleBazelContent, tsVersion);
  }

  if (nvmrcVersion) {
    moduleBazelContent = await syncNodeJs(moduleBazelContent, nvmrcVersion);
  }

  if (originalBazelContent !== moduleBazelContent) {
    writeFileSync(moduleBazelPath, moduleBazelContent);

    await formatFiles([moduleBazelPath]);

    ChildProcess.spawnSync(getBazelBin(), ['mod', 'deps', '--lockfile_mode=update'], {
      suppressErrorOnFailingExitCode: true,
    });
  }
}

/** CLI command module. */
export const SyncModuleBazelModule: CommandModule = {
  builder,
  handler,
  command: 'sync-module-bazel',
  describe:
    'Sync node.js, pnpm and typescript versions in MODULE.bazel with package.json and .nvmrc.',
};
