/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {execFile} from 'node:child_process';
import {resolve} from 'node:path';
import semver from 'semver';

import {EXIT_GATE_PROJECT_NAME_REGEX} from '../config/index.js';
import {ChildProcess} from '../../utils/child-process.js';
import {getExcludedDirsForCwd, sanitizeEnvironmentPath} from '../../utils/environment.js';
import {Log} from '../../utils/logging.js';

export {EXIT_GATE_PROJECT_NAME_REGEX};

export const EXIT_GATE_GCP_PROJECT = 'oss-exit-gate-prod';
export const EXIT_GATE_AR_LOCATION = 'us';
export const EXIT_GATE_AR_HOST = 'us-npm.pkg.dev';
export const EXIT_GATE_MANIFEST_BUCKET = 'oss-exit-gate-prod-projects-bucket';
export const PUBLIC_NPM_REGISTRY_URL = 'https://registry.npmjs.org/';
export const ALLOWED_NPM_DIST_TAG_REGEX = /^(?:latest|next|do-not-use-exceptional-minor|v\d+-lts)$/;

const MANIFEST_FILE_NAME_REGEX = /^[a-zA-Z0-9._-]+\.json$/;
const AUTH_TOKEN_ENV_VAR_NAME_REGEX = /^[A-Z_][A-Z0-9_]*$/;
const COMMIT_SHA_REGEX = /^[0-9a-fA-F]{7,40}$/;
const SINGLE_LINE_NO_WHITESPACE_REGEX = /^[^\s\r\n]+$/;
const GLOB_CHAR_REGEX = /[*?[\]]/;

const GCLOUD_NOT_FOUND_ERROR_MESSAGE =
  'Failed to execute "gcloud". Please ensure the Google Cloud SDK is installed and available in your PATH.';

export interface ExitGatePublishingManifest {
  publish_all: boolean;
  registry_config: {
    npm: {
      tags: string[];
    };
  };
}

export interface ExitGateAccessTokenOptions {
  /** Whether to fetch local Application Default Credentials (`gcloud auth application-default`). */
  useApplicationDefault?: boolean;
  /** Optional callback invoked immediately with the retrieved token to mask it in CI logs. */
  maskSecret?: (secret: string) => void;
}

export interface ExitGateGcloudOptions {
  /**
   * Optional OAuth2 access token to pass via `CLOUDSDK_AUTH_ACCESS_TOKEN` (required when
   * authenticating `gcloud` CLI with local ADC).
   */
  accessToken?: string;
}

/** Validates and returns an OSS Exit Gate project name. */
export function assertValidExitGateProject(projectName: string): string {
  if (typeof projectName !== 'string' || !EXIT_GATE_PROJECT_NAME_REGEX.test(projectName)) {
    throw new Error(
      `Invalid OSS Exit Gate project name "${String(projectName)}". ` +
        `Expected a project name matching ${EXIT_GATE_PROJECT_NAME_REGEX}.`,
    );
  }
  return projectName;
}

/** Validates that an NPM dist-tag is one of the allowed Angular release tags. */
export function assertValidNpmDistTag(distTag: string): void {
  if (typeof distTag !== 'string' || !ALLOWED_NPM_DIST_TAG_REGEX.test(distTag)) {
    throw new Error(
      `Invalid NPM dist-tag "${String(distTag)}". ` +
        `Expected a dist-tag matching ${ALLOWED_NPM_DIST_TAG_REGEX}.`,
    );
  }
}

/** Returns the Artifact Registry repository name for the given Exit Gate project. */
export function getExitGateArRepositoryName(projectName: string): string {
  const validProject = assertValidExitGateProject(projectName);
  return `${validProject}--npm`;
}

/** Returns the Artifact Registry npm registry URL for the given Exit Gate project. */
export function getExitGateArRegistryUrl(projectName: string): string {
  return `https://${EXIT_GATE_AR_HOST}/${EXIT_GATE_GCP_PROJECT}/${getExitGateArRepositoryName(projectName)}/`;
}

/** Returns the GCS URI where an Exit Gate publishing manifest should be uploaded. */
export function getExitGateManifestGcsUri(projectName: string, manifestFileName: string): string {
  const validProject = assertValidExitGateProject(projectName);
  if (
    typeof manifestFileName !== 'string' ||
    !MANIFEST_FILE_NAME_REGEX.test(manifestFileName) ||
    manifestFileName.includes('..')
  ) {
    throw new Error(
      `Invalid Exit Gate manifest file name "${String(manifestFileName)}". ` +
        `Expected a flat JSON file name matching ${MANIFEST_FILE_NAME_REGEX} without "..".`,
    );
  }
  return `gs://${EXIT_GATE_MANIFEST_BUCKET}/${validProject}/npm/manifests/${manifestFileName}`;
}

/**
 * Builds `.npmrc` content targeting the Exit Gate Artifact Registry repository using
 * environment variable indirection so no raw token is written to disk.
 */
export function buildExitGateNpmrcContent(
  projectName: string,
  authTokenEnvVarName = 'EXIT_GATE_AR_TOKEN',
): string {
  if (
    typeof authTokenEnvVarName !== 'string' ||
    !AUTH_TOKEN_ENV_VAR_NAME_REGEX.test(authTokenEnvVarName)
  ) {
    throw new Error(
      `Invalid auth token environment variable name "${String(authTokenEnvVarName)}". ` +
        `Expected an identifier matching ${AUTH_TOKEN_ENV_VAR_NAME_REGEX}.`,
    );
  }

  const repoPath = `${EXIT_GATE_AR_HOST}/${EXIT_GATE_GCP_PROJECT}/${getExitGateArRepositoryName(projectName)}/`;
  return (
    [
      `registry=https://${repoPath}`,
      `//${repoPath}:_authToken=\${${authTokenEnvVarName}}`,
      `provenance=false`,
    ].join('\n') + '\n'
  );
}

/** Creates an OSS Exit Gate publishing manifest for the given NPM dist-tag. */
export function createExitGateManifest(npmDistTag: string): ExitGatePublishingManifest {
  assertValidNpmDistTag(npmDistTag);
  return {
    publish_all: true,
    registry_config: {
      npm: {
        tags: [npmDistTag],
      },
    },
  };
}

/** Creates a deterministic, safe manifest file name for an Exit Gate publish run. */
export function createManifestFileName(
  version: string,
  sha: string,
  timestamp = Date.now(),
): string {
  const parsed = typeof version === 'string' ? semver.parse(version) : null;
  if (!parsed) {
    throw new Error(
      `Invalid SemVer version "${String(version)}" provided for Exit Gate manifest file name.`,
    );
  }
  if (typeof sha !== 'string' || !COMMIT_SHA_REGEX.test(sha)) {
    throw new Error(
      `Invalid commit SHA "${String(sha)}" provided for Exit Gate manifest file name. ` +
        `Expected a 7-40 character hexadecimal SHA.`,
    );
  }
  if (typeof timestamp !== 'number' || !Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new Error(
      `Invalid timestamp "${String(timestamp)}" provided for Exit Gate manifest file name. ` +
        `Expected a non-negative integer.`,
    );
  }
  return `manifest-${parsed.format()}-${sha.slice(0, 8)}-${timestamp}.json`;
}

/** Helpers for invoking `gcloud` commands required by the OSS Exit Gate publishing flow. */
export abstract class ExitGateCommand {
  /**
   * Executes `gcloud` directly via `execFile` so token stdout never flows through
   * `ChildProcess.spawn` or `Log.debug`. Exposed with a leading underscore for test spying.
   */
  static _execGcloudForToken(args: string[]): Promise<string> {
    const env = sanitizeEnvironmentPath(process.env, getExcludedDirsForCwd());
    return new Promise<string>((resolvePromise, rejectPromise) => {
      execFile('gcloud', args, {encoding: 'utf8', shell: false, env}, (error, stdout) => {
        if (error) {
          rejectPromise(error);
          return;
        }
        resolvePromise(stdout);
      });
    });
  }

  /**
   * Retrieves a short-lived GCP OAuth2 access token via `gcloud` without ever logging
   * stdout/stderr or the returned token.
   */
  static async getAccessToken(options: ExitGateAccessTokenOptions = {}): Promise<string> {
    const args = options.useApplicationDefault
      ? ['auth', 'application-default', 'print-access-token', '--quiet']
      : ['auth', 'print-access-token', '--quiet'];

    let rawOutput: string;
    try {
      rawOutput = await this._execGcloudForToken(args);
    } catch (error) {
      if (isEnoentError(error)) {
        throw new Error(GCLOUD_NOT_FOUND_ERROR_MESSAGE);
      }
      const authMode = options.useApplicationDefault ? 'application-default ' : '';
      const rawCode =
        error !== null && typeof error === 'object' && 'code' in error
          ? (error as {code?: unknown}).code
          : undefined;
      const errorCode =
        typeof rawCode === 'number' || (typeof rawCode === 'string' && rawCode !== '')
          ? ` (code: ${String(rawCode)})`
          : '';
      throw new Error(
        `Failed to obtain GCP access token via "gcloud auth ${authMode}print-access-token"${errorCode}.`,
      );
    }

    const token = rawOutput.trim();
    if (!SINGLE_LINE_NO_WHITESPACE_REGEX.test(token)) {
      throw new Error(
        'Received an empty or malformed access token from "gcloud". ' +
          'Expected a single-line non-empty token without whitespace.',
      );
    }

    options.maskSecret?.(token);
    return token;
  }

  /** Checks whether local Application Default Credentials are currently authenticated. */
  static async checkAdcAuthenticated(): Promise<boolean> {
    try {
      await this.getAccessToken({useApplicationDefault: true});
      return true;
    } catch {
      return false;
    }
  }

  /** Launches interactive `gcloud auth application-default login` in the current TTY. */
  static async startInteractiveAdcLogin(): Promise<void> {
    try {
      await ChildProcess.spawnInteractive('gcloud', ['auth', 'application-default', 'login']);
    } catch (error) {
      if (isEnoentError(error)) {
        throw new Error(GCLOUD_NOT_FOUND_ERROR_MESSAGE);
      }
      throw error;
    }
  }

  /**
   * Lists and deletes all existing packages from the Exit Gate Artifact Registry staging
   * repository for the specified project.
   *
   * @returns The list of deleted Artifact Registry package resource names.
   */
  static async cleanArtifactRegistryPackages(
    projectName: string,
    options?: ExitGateGcloudOptions,
  ): Promise<string[]> {
    const repo = getExitGateArRepositoryName(projectName);
    const spawnOptions = buildGcloudSpawnOptions(options);

    let listResult;
    try {
      listResult = await ChildProcess.spawn(
        'gcloud',
        [
          'artifacts',
          'packages',
          'list',
          '--project',
          EXIT_GATE_GCP_PROJECT,
          '--location',
          EXIT_GATE_AR_LOCATION,
          '--repository',
          repo,
          '--format',
          'value(name)',
          '--quiet',
        ],
        spawnOptions,
      );
    } catch (error) {
      if (isEnoentError(error)) {
        throw new Error(GCLOUD_NOT_FOUND_ERROR_MESSAGE);
      }
      throw error;
    }

    const packageResourceNames = listResult.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const expectedPrefix = `projects/${EXIT_GATE_GCP_PROJECT}/locations/${EXIT_GATE_AR_LOCATION}/repositories/${repo}/packages/`;
    for (const pkgResourceName of packageResourceNames) {
      if (
        !pkgResourceName.startsWith(expectedPrefix) ||
        pkgResourceName.length <= expectedPrefix.length ||
        !SINGLE_LINE_NO_WHITESPACE_REGEX.test(pkgResourceName) ||
        pkgResourceName.includes('..')
      ) {
        throw new Error(
          `Unexpected Artifact Registry package resource name "${pkgResourceName}". ` +
            `Expected prefix "${expectedPrefix}".`,
        );
      }
    }

    if (packageResourceNames.length === 0) {
      Log.debug(`No stale packages found in Artifact Registry repository "${repo}".`);
      return [];
    }

    for (const pkgResourceName of packageResourceNames) {
      Log.debug(`Deleting Artifact Registry package "${pkgResourceName}".`);
      await ChildProcess.spawn(
        'gcloud',
        ['artifacts', 'packages', 'delete', pkgResourceName, '--quiet'],
        spawnOptions,
      );
    }

    Log.info(
      `Deleted ${packageResourceNames.length} package(s) from Artifact Registry repository "${repo}".`,
    );
    return packageResourceNames;
  }

  /**
   * Uploads a local JSON publishing manifest to the Exit Gate GCS bucket for the given project.
   *
   * @returns The destination GCS URI.
   */
  static async uploadManifest(
    localManifestPath: string,
    projectName: string,
    manifestFileName: string,
    options?: ExitGateGcloudOptions,
  ): Promise<string> {
    const gcsUri = getExitGateManifestGcsUri(projectName, manifestFileName);

    if (typeof localManifestPath !== 'string' || localManifestPath.trim() === '') {
      throw new Error('Local manifest path must be a non-empty string.');
    }

    const resolvedPath = resolve(localManifestPath);
    if (GLOB_CHAR_REGEX.test(resolvedPath)) {
      throw new Error(
        `Invalid local manifest path "${resolvedPath}". ` +
          `Path must not contain glob characters (*, ?, [, ]).`,
      );
    }

    const spawnOptions = buildGcloudSpawnOptions(options);

    try {
      await ChildProcess.spawn(
        'gcloud',
        ['storage', 'cp', '--content-type=application/json', '--quiet', resolvedPath, gcsUri],
        spawnOptions,
      );
    } catch (error) {
      if (isEnoentError(error)) {
        throw new Error(GCLOUD_NOT_FOUND_ERROR_MESSAGE);
      }
      throw error;
    }

    Log.debug(`Uploaded Exit Gate publishing manifest to "${gcsUri}".`);
    return gcsUri;
  }
}

/** Builds silent `ChildProcess.spawn` options for `gcloud`, attaching an ADC access token if given. */
function buildGcloudSpawnOptions(options?: ExitGateGcloudOptions): {
  mode: 'silent';
  sensitiveOutput?: boolean;
  env?: NodeJS.ProcessEnv;
} {
  if (options?.accessToken !== undefined) {
    return {
      mode: 'silent',
      sensitiveOutput: true,
      env: {...process.env, CLOUDSDK_AUTH_ACCESS_TOKEN: options.accessToken},
    };
  }
  return {mode: 'silent'};
}

/** Checks whether an unknown error represents a Node.js `ENOENT` error. */
function isEnoentError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (error as {code?: unknown}).code === 'ENOENT'
  );
}
