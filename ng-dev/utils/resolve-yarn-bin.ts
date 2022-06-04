/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import which from 'which';

import {isNodeJSWrappedError} from './nodejs-errors';
import {parse as parseLockfile} from '@yarnpkg/lockfile';
import {parse as parseYaml} from 'yaml';
import {ChildProcess} from './child-process';
import {Log} from './logging';

/** Type describing a Yarn configuration and its potential properties. */
export interface YarnConfiguration {
  'yarnPath': string | undefined;
  'yarn-path': string | undefined;
}

/** Type describing a configuration with its corresponding parsing mechanism. */
export type ConfigWithParser = {fileName: string; parse: (c: string) => YarnConfiguration};

/** Interface describing a command that will invoke Yarn. */
export interface YarnCommandInfo {
  binary: string;
  args: string[];
}

/** List of Yarn configuration files and their parsing mechanisms. */
export const yarnConfigFiles: ConfigWithParser[] = [
  {fileName: '.yarnrc', parse: (c) => parseLockfile(c).object},
  {fileName: '.yarnrc.yml', parse: (c) => parseYaml(c)},
];

/**
 * Resolves Yarn for the given project directory.
 *
 * This function exists so that Yarn can be invoked from within Yarn-initiated processes.
 * Yarn uses some magical logic where it creates a temporary directory to make Yarn resolvable.
 * This temporary directory is then wired up in `process.env.PATH` and can break for example
 * when a command switches branches, causing the originally invoked Yarn checked-in file to
 * become unavailable.
 */
export async function resolveYarnScriptForProject(projectDir: string): Promise<YarnCommandInfo> {
  const yarnPathFromConfig = await getYarnPathFromConfigurationIfPresent(projectDir);
  if (yarnPathFromConfig !== null) {
    return {binary: 'node', args: [yarnPathFromConfig]};
  }

  const yarnPathFromNpmBin = await getYarnPathFromNpmGlobalBinaries();
  if (yarnPathFromNpmBin !== null) {
    return {binary: yarnPathFromNpmBin, args: []};
  }

  return {binary: 'yarn', args: []};
}

/** Gets the path to the Yarn binary from the NPM global binary directory. */
export async function getYarnPathFromNpmGlobalBinaries(): Promise<string | null> {
  const npmGlobalBinPath = await getNpmGlobalBinPath();
  if (npmGlobalBinPath === null) {
    return null;
  }
  try {
    return await which('yarn', {path: npmGlobalBinPath});
  } catch (e) {
    Log.debug('Could not find Yarn within NPM global binary directory. Error:', e);
    return null;
  }
}

/** Gets the path to the system-wide global NPM binary directory. */
async function getNpmGlobalBinPath(): Promise<string | null> {
  try {
    return (await ChildProcess.spawn('npm', ['bin', '--global'], {mode: 'silent'})).stdout.trim();
  } catch (e) {
    Log.debug('Could not determine NPM global binary directory. Error:', e);
    return null;
  }
}

/** Gets the Yarn path from the Yarn configuration if present. */
async function getYarnPathFromConfigurationIfPresent(projectDir: string): Promise<string | null> {
  const yarnRc = await findAndParseYarnConfiguration(projectDir);
  if (yarnRc === null) {
    return null;
  }

  const yarnPath = yarnRc['yarn-path'] ?? yarnRc['yarnPath'];
  if (yarnPath === undefined) {
    return null;
  }

  return path.resolve(projectDir, yarnPath);
}

/** Finds and parses the Yarn configuration file for the given project. */
async function findAndParseYarnConfiguration(
  projectDir: string,
): Promise<YarnConfiguration | null> {
  const files = await Promise.all(
    yarnConfigFiles.map(async (entry) => ({
      entry,
      content: await readFileGracefully(path.join(projectDir, entry.fileName)),
    })),
  );
  const config = files.find((entry) => entry.content !== null);
  if (config === undefined) {
    return null;
  }

  try {
    return config.entry.parse(config.content!);
  } catch (e) {
    Log.debug(`Could not parse determined Yarn configuration file (${config.entry.fileName}).`);
    Log.debug(`Error:`, e);
    return null;
  }
}

/**
 * Reads the specified file gracefully.
 * @returns The file contents. Null if the file does not exist.
 */
async function readFileGracefully(filePath: string): Promise<string | null> {
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch (error) {
    if (isNodeJSWrappedError(error, Error) && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}
