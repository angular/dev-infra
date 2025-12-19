/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, CommandModule} from 'yargs';
import {readFileSync, writeFileSync} from 'node:fs';
import {execSync} from 'node:child_process';
import {join} from 'node:path';
import {Log} from '../../utils/logging';

async function builder(argv: Argv) {
  return argv;
}

async function handler() {
  const rootDir = process.cwd();
  const packageJsonPath = join(rootDir, 'package.json');
  const moduleBazelPath = join(rootDir, 'MODULE.bazel');

  interface PackageJson {
    engines?: {
      pnpm?: string;
    };
    dependencies?: {
      typescript?: string;
    };
    devDependencies?: {
      typescript?: string;
    };
  }

  // Read package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson;
  const pnpmVersion = packageJson.engines?.pnpm;
  const tsVersion = packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript;

  if (!pnpmVersion) {
    throw new Error('Could not find engines.pnpm in package.json');
  }

  if (!tsVersion) {
    throw new Error('Could not find typescript in dependencies or devDependencies in package.json');
  }

  // Helper to get integrity
  async function getIntegrity(pkg: string, version: string): Promise<string> {
    const response = await fetch(`https://registry.npmjs.org/${pkg}/${version}`);
    if (!response.ok) {
      throw new Error(`Failed to request ${pkg}@${version}: ${response.statusText}`);
    }

    const {dist} = (await response.json()) as {dist: {integrity: string}};

    return dist.integrity;
  }

  // Read MODULE.bazel
  let originalBazelContent = readFileSync(moduleBazelPath, 'utf8');
  let moduleBazelContent = originalBazelContent;

  if (moduleBazelContent.includes('pnpm_version')) {
    console.log(`Resolving integrity for pnpm@${pnpmVersion}...`);
    const pnpmIntegrity = await getIntegrity('pnpm', pnpmVersion);

    // Update pnpm version and integrity
    moduleBazelContent = moduleBazelContent.replace(
      /pnpm_version = ".*?"/,
      `pnpm_version = "${pnpmVersion}"`,
    );

    if (moduleBazelContent.includes('pnpm_version_integrity =')) {
      moduleBazelContent = moduleBazelContent.replace(
        /pnpm_version_integrity = ".*?"/,
        `pnpm_version_integrity = "${pnpmIntegrity}"`,
      );
    } else {
      moduleBazelContent = moduleBazelContent.replace(
        /pnpm_version = ".*?"/,
        `$&,\n    pnpm_version_integrity = "${pnpmIntegrity}"`,
      );
    }
  }

  // Update typescript version and integrity
  if (moduleBazelContent.includes('ts_version')) {
    console.log(`Resolving integrity for typescript@${tsVersion}...`);
    const tsIntegrity = await getIntegrity('typescript', tsVersion);

    moduleBazelContent = moduleBazelContent.replace(
      /ts_version = ".*?"/,
      `ts_version = "${tsVersion}"`,
    );
    moduleBazelContent = moduleBazelContent.replace(
      /ts_integrity = ".*?"/,
      `ts_integrity = "${tsIntegrity}"`,
    );

    if (originalBazelContent !== moduleBazelContent) {
      writeFileSync(moduleBazelPath, moduleBazelContent);

      try {
        execSync('pnpm bazel mod deps --lockfile_mode=update', {stdio: 'inherit'});
      } catch (e) {
        Log.debug(e);
      }
    }
  }
}

/** CLI command module. */
export const SyncModuleBazelModule: CommandModule = {
  builder,
  handler,
  command: 'sync-module-bazel',
  describe: 'Sync pnpm and typescript versions in MODULE.bazel with package.json.',
};
