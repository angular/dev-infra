/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {pathToFileURL} from 'url';
import {join} from 'path';
import {Assertions, MultipleAssertions} from './config-assertions.js';

import {Log} from './logging.js';
import {getCachedConfig, setCachedConfig} from './config-cache.js';
import {determineRepoBaseDirFromCwd} from './repo-directory.js';

/**
 * Type describing a ng-dev configuration.
 *
 * This is a branded type to ensure that we can safely assert an object
 * being a config object instead of it being e.g. a `Promise` object.
 */
export type NgDevConfig<T = {}> = T & {
  __isNgDevConfigObject: boolean;
};

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
const CONFIG_FILE_PATH = '.ng-dev/config.mjs';

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
export async function getConfig(): Promise<NgDevConfig>;
export async function getConfig(baseDir: string): Promise<NgDevConfig>;
export async function getConfig<A extends MultipleAssertions>(
  assertions: A,
): Promise<NgDevConfig<Assertions<A>>>;
export async function getConfig(baseDirOrAssertions?: unknown) {
  let cachedConfig = getCachedConfig();

  if (cachedConfig === null) {
    let baseDir: string;
    if (typeof baseDirOrAssertions === 'string') {
      baseDir = baseDirOrAssertions;
    } else {
      baseDir = determineRepoBaseDirFromCwd();
    }

    // If the global config is not defined, load it from the file system.
    // The full path to the configuration file.
    const configPath = join(baseDir, CONFIG_FILE_PATH);
    // Read the configuration and validate it before caching it for the future.
    cachedConfig = await readConfigFile(configPath);

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
  return {...cachedConfig, __isNgDevConfigObject: true};
}

/**
 * Get the local user configuration from the file system, returning the already loaded copy if it is
 * defined.
 *
 * @returns The user configuration object, or an empty object if no user configuration file is
 * present. The object is an untyped object as there are no required user configurations.
 */
export async function getUserConfig() {
  // If the global config is not defined, load it from the file system.
  if (userConfig === null) {
    // The full path to the configuration file.
    const configPath = join(determineRepoBaseDirFromCwd(), USER_CONFIG_FILE_PATH);
    // Set the global config object.
    userConfig = await readConfigFile(configPath, true);
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
export function assertValidGithubConfig<T extends NgDevConfig>(
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
 * Resolves and reads the specified configuration file, optionally returning an empty object
 * if the configuration file cannot be read.
 */
async function readConfigFile(configPath: string, returnEmptyObjectOnError = false): Promise<{}> {
  try {
    // ESM imports expect a valid URL. On Windows, the disk name causes errors like:
    // `ERR_UNSUPPORTED_ESM_URL_SCHEME: <..> Received protocol 'c:'`
    return await import(pathToFileURL(configPath).toString());
  } catch (e) {
    if (returnEmptyObjectOnError) {
      Log.debug(
        `Could not read configuration file at ${configPath}, returning empty object instead.`,
      );
      Log.debug(e);
      return {};
    }
    Log.error(`Could not read configuration file at ${configPath}.`);
    Log.error(e);
    process.exit(1);
  }
}
