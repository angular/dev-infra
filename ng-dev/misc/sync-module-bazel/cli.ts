/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, CommandModule} from 'yargs';
import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {determineRepoBaseDirFromCwd} from '../../utils/repo-directory';
import {PackageJson, syncNodeJs, syncPnpm, syncTypeScript} from './sync-module-bazel';
import {ChildProcess} from '../../utils/child-process';
import {formatFiles} from '../../format/format';

async function builder(argv: Argv) {
  return argv;
}

async function handler() {
  const rootDir = determineRepoBaseDirFromCwd();
  const packageJsonPath = join(rootDir, 'package.json');
  const moduleBazelPath = join(rootDir, 'MODULE.bazel');
  const nvmrcPath = join(rootDir, '.nvmrc');

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

  if (!pnpmVersion) {
    throw new Error('Could find engines.pnpm in package.json');
  }

  if (!tsVersion) {
    throw new Error('Could not find typescript in dependencies or devDependencies in package.json');
  }

  // Read MODULE.bazel
  const originalBazelContent = readFileSync(moduleBazelPath, 'utf8');
  let moduleBazelContent = originalBazelContent;

  moduleBazelContent = await syncPnpm(moduleBazelContent, pnpmVersion);
  moduleBazelContent = await syncTypeScript(moduleBazelContent, tsVersion);
  moduleBazelContent = await syncNodeJs(moduleBazelContent, nvmrcVersion);

  if (originalBazelContent !== moduleBazelContent) {
    writeFileSync(moduleBazelPath, moduleBazelContent);

    await formatFiles(['MODULE.bazel']);

    ChildProcess.spawnSync('pnpm', ['bazel', 'mod', 'deps', '--lockfile_mode=update'], {
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
