/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Minimatch} from 'minimatch';
import fs from 'fs';
import * as jsonc from '../../tools/esm-interop/jsonc-parser.js';

/** Configuration describing how files are synced into Google. */
export interface GoogleSyncConfig {
  /**
   * Patterns matching files which are synced into Google. Patterns
   * should be relative to the project directory.
   */
  syncedFilePatterns: string[];
  /**
   * Patterns matching files which are never synced into Google. Patterns
   * should be relative to the project directory.
   */
  alwaysExternalFilePatterns: string[];
  /**
   * Patterns matching files which need to be synced separately.
   * Patterns should be relative to the project directory.
   */
  separateFilePatterns: string[];
}

/** Describes a function for testing if a file is synced. */
export type SyncFileMatchFn = (projectRelativePath: string) => boolean;

/** Error class used when the Google Sync configuration is invalid. */
export class InvalidGoogleSyncConfigError extends Error {}

/** Transforms the given sync configuration into a file match function. */
export function transformConfigIntoMatcher(config: GoogleSyncConfig): {
  ngSyncMatchFn: SyncFileMatchFn;
  separateSyncMatchFn: SyncFileMatchFn;
} {
  const syncedFilePatterns = config.syncedFilePatterns.map((p) => new Minimatch(p));
  const alwaysExternalFilePatterns = config.alwaysExternalFilePatterns.map((p) => new Minimatch(p));
  const separateFilePatterns = config.separateFilePatterns.map((p) => new Minimatch(p));

  // match everything that needs to be synced except external and separate sync files
  const ngSyncMatchFn = (projectRelativePath: string) =>
    syncedFilePatterns.some((p) => p.match(projectRelativePath)) &&
    alwaysExternalFilePatterns.every((p) => !p.match(projectRelativePath)) &&
    separateFilePatterns.every((p) => !p.match(projectRelativePath));

  // match only files that need to be synced separately
  const separateSyncMatchFn = (projectRelativePath: string) =>
    separateFilePatterns.some((p) => p.match(projectRelativePath)) &&
    alwaysExternalFilePatterns.every((p) => !p.match(projectRelativePath)) &&
    syncedFilePatterns.every((p) => !p.match(projectRelativePath));
  return {ngSyncMatchFn, separateSyncMatchFn};
}

/**
 * Reads the configuration file from the given path.
 *
 * @throws {InvalidGoogleSyncConfigError} If the configuration is invalid.
 */
export async function getGoogleSyncConfig(absolutePath: string): Promise<{
  ngMatchFn: SyncFileMatchFn;
  separateMatchFn: SyncFileMatchFn;
  config: GoogleSyncConfig;
}> {
  const content = await fs.promises.readFile(absolutePath, 'utf8');
  const errors: jsonc.ParseError[] = [];
  const config = jsonc.parse(content, errors) as GoogleSyncConfig;
  if (errors.length !== 0) {
    throw new InvalidGoogleSyncConfigError(
      `Google Sync Configuration is invalid: ` +
        errors.map((e) => jsonc.printParseErrorCode(e.error)).join('\n'),
    );
  }
  const matchFns = transformConfigIntoMatcher(config);
  return {
    config,
    ngMatchFn: matchFns.ngSyncMatchFn,
    separateMatchFn: matchFns.separateSyncMatchFn,
  };
}
