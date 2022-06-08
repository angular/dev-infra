/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {URL} from 'url';

import {GithubConfig} from '../config.js';
import {GitClient} from './git-client.js';

/** URL to the Github page where personal access tokens can be managed. */
export const GITHUB_TOKEN_SETTINGS_URL = 'https://github.com/settings/tokens';

/** URL to the Github page where personal access tokens can be generated. */
export const GITHUB_TOKEN_GENERATE_URL = 'https://github.com/settings/tokens/new';

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
    return `git@github.com:${config.owner}/${config.name}.git`;
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
