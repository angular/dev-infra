/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {URL} from 'url';

import {GithubConfig} from '../config';
import {GitClient} from './git-client';

/** URL to the Github page where personal access tokens can be managed. */
export const GITHUB_TOKEN_SETTINGS_URL = 'https://github.com/settings/tokens';

/** URL to the Github page where personal access tokens can be generated. */
export const GITHUB_TOKEN_GENERATE_URL = 'https://github.com/settings/tokens/new';

/** Prefix for accessing Github via HTTPS. */
export const GITHUB_URL_PREFIX = 'https://github.com';

/** Prefix for accessing Github via SSH. */
export const GITHUB_SSH_PREFIX = 'git@github.com';

/** Adds the provided token to the given Github HTTPs remote url. */
export function addTokenToGitHttpsUrl(githubHttpsUrl: string, token: string) {
  const url = new URL(githubHttpsUrl);
  url.password = token;
  url.username = '_';
  return url.href;
}

/** Gets the repository Git URL for the given github config. */
export function getRepositoryGitUrl(
  config: Pick<GithubConfig, 'name' | 'owner' | 'useSsh'>,
  githubToken?: string,
): string {
  if (config.useSsh) {
    return `${GITHUB_SSH_PREFIX}:${config.owner}/${config.name}.git`;
  }
  const baseHttpUrl = `https://github.com/${config.owner}/${config.name}.git`;
  if (githubToken !== undefined) {
    return addTokenToGitHttpsUrl(baseHttpUrl, githubToken);
  }
  return baseHttpUrl;
}

/** Gets a Github URL that refers to a list of recent commits within a specified branch. */
export function getListCommitsInBranchUrl(client: GitClient, branchName: string) {
  const {owner, repo} = client.remoteParams;
  return `https://github.com/${owner}/${repo}/commits/${branchName}`;
}

/** Gets a Github URL for viewing the file contents of a specified file for the given ref. */
export function getFileContentsUrl(client: GitClient, ref: string, relativeFilePath: string) {
  const {owner, repo} = client.remoteParams;
  return `https://github.com/${owner}/${repo}/blob/${ref}/${relativeFilePath}`;
}
