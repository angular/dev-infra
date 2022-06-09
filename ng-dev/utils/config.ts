/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync} from 'fs';
import {dirname, join} from 'path';
import {Assertions, MultipleAssertions} from './assertion-typings';

import {debug, error} from './console';
import {GitClient} from './git/git-client';
import {isTsNodeAvailable} from './ts-node';

/**
 * Describes the Github configuration for dev-infra. This configuration is
 * used for API requests, determining the upstream remote, etc.
 */
export interface GithubConfig {
  /** Owner name of the repository. */
  owner: string;
  /** Name of the repository. */
  name: string;
  /** Main branch name for the repository. */
  mainBranchName: string;
  /** If SSH protocol should be used for git interactions. */
  useSsh?: boolean;
  /** Whether the specified repository is private. */
  private?: boolean;
}

/**
 * The filename expected for creating the ng-dev config, without the file
 * extension to allow either a typescript or javascript file to be used.
 */
const CONFIG_FILE_PATH = '.ng-dev/config';

/** The configuration for ng-dev. */
let cachedConfig: {} | null = null;

/**
 * The filename expected for local user config, without the file extension to allow a typescript,
 * javascript or json file to be used.
 */
const USER_CONFIG_FILE_PATH = '.ng-dev.user';

/** The local user configuration for ng-dev. */
let userConfig: {[key: string]: any} | null = null;

/**
 * Set the cached configuration object to be loaded later. Only to be used on
 * CI and test situations in which loading from the `.ng-dev/` directory is not possible.
 */
export const setConfig = setCachedConfig;

/**
 * Get the configuration from the file system, returning the already loaded
 * copy if it is defined.
 */
export function getConfig(): {};
export function getConfig(baseDir: string): {};
export function getConfig<A extends MultipleAssertions>(assertions: A): Assertions<A>;
export function getConfig(baseDirOrAssertions?: unknown) {
  let cachedConfig = getCachedConfig();

  if (cachedConfig === null) {
    let baseDir: string;
    if (typeof baseDirOrAssertions === 'string') {
      baseDir = baseDirOrAssertions;
    } else {
      baseDir = GitClient.get().baseDir;
    }

    // If the global config is not defined, load it from the file system.
    // The full path to the configuration file.
    const configPath = join(baseDir, CONFIG_FILE_PATH);
    // Read the configuration and validate it before caching it for the future.
    cachedConfig = readConfigFile(configPath);

    // Store the newly-read configuration in the cache.
    setCachedConfig(cachedConfig);
  }

  if (Array.isArray(baseDirOrAssertions)) {
    for (const assertion of baseDirOrAssertions) {
      assertion(cachedConfig);
    }
  }

  // Return a clone of the cached global config to ensure that a new instance of the config
  // is returned each time, preventing unexpected effects of modifications to the config object.
  return {...cachedConfig};
}

/**
 * Get the local user configuration from the file system, returning the already loaded copy if it is
 * defined.
 *
 * @returns The user configuration object, or an empty object if no user configuration file is
 * present. The object is an untyped object as there are no required user configurations.
 */
export function getUserConfig() {
  // If the global config is not defined, load it from the file system.
  if (userConfig === null) {
    const git = GitClient.get();
    // The full path to the configuration file.
    const configPath = join(git.baseDir, USER_CONFIG_FILE_PATH);
    // Set the global config object.
    userConfig = readConfigFile(configPath, true);
  }
  // Return a clone of the user config to ensure that a new instance of the config is returned
  // each time, preventing unexpected effects of modifications to the config object.
  return {...userConfig};
}

/** A standard error class to thrown during assertions while validating configuration. */
export class ConfigValidationError extends Error {
  constructor(message?: string, public readonly errors: string[] = []) {
    super(message);
  }
}

/** Validate th configuration has been met for the ng-dev command. */
export function assertValidGithubConfig<T>(
  config: T & Partial<{github: GithubConfig}>,
): asserts config is T & {github: GithubConfig} {
  const errors: string[] = [];
  // Validate the github configuration.
  if (config.github === undefined) {
    errors.push(`Github repository not configured. Set the "github" option.`);
  } else {
    if (config.github.name === undefined) {
      errors.push(`"github.name" is not defined`);
    }
    if (config.github.owner === undefined) {
      errors.push(`"github.owner" is not defined`);
    }
  }
  if (errors.length) {
    throw new ConfigValidationError('Invalid `github` configuration', errors);
  }
}

/**
 * Resolves and reads the specified configuration file, optionally returning an empty object if the
 * configuration file cannot be read.
 */
function readConfigFile(configPath: string, returnEmptyObjectOnError = false): {} {
  // If the `.ts` extension has not been set up already, and a TypeScript based
  // version of the given configuration seems to exist, set up `ts-node` if available.
  if (
    require.extensions['.ts'] === undefined &&
    existsSync(`${configPath}.ts`) &&
    isTsNodeAvailable()
  ) {
    // Ensure the module target is set to `commonjs`. This is necessary because the
    // dev-infra tool runs in NodeJS which does not support ES modules by default.
    // Additionally, set the `dir` option to the directory that contains the configuration
    // file. This allows for custom compiler options (such as `--strict`).
    require('ts-node').register({
      dir: dirname(configPath),
      transpileOnly: true,
      compilerOptions: {module: 'commonjs'},
    });
  }

  try {
    return require(configPath);
  } catch (e) {
    if (returnEmptyObjectOnError) {
      debug(`Could not read configuration file at ${configPath}, returning empty object instead.`);
      debug(e);
      return {};
    }
    error(`Could not read configuration file at ${configPath}.`);
    error(e);
    process.exit(1);
  }
}
