/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Minimatch} from 'minimatch';
import path from 'path';
import {
  CaretakerConfig,
  GithubConfig,
  GoogleSyncConfig,
  NgDevConfig,
  assertValidCaretakerConfig,
} from '../../../utils/config.js';
import {SyncFileMatchFn, getGoogleSyncConfig} from '../../../utils/g3-sync-config.js';
import {G3StatsData, G3Stats} from '../../../utils/g3.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {fetchPullRequestFilesFromGithub} from '../fetch-pull-request.js';

/** Assert the pull request has passing enforced statuses. */
// TODO: update typings to make sure portability is properly handled for windows build.
export const isolatedSeparateFilesValidation = createPullRequestValidation(
  {name: 'assertIsolatedSeparateFiles', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  async assert(
    config: NgDevConfig<{
      github: GithubConfig;
    }>,
    prNumber: number,
    gitClient: AuthenticatedGitClient,
  ) {
    try {
      assertValidCaretakerConfig(config);
    } catch {
      throw this._createError('No Caretaker Config was found.');
    }

    const g3SyncConfigWithMatchers = await getGsyncConfig(config.caretaker, gitClient);
    if (g3SyncConfigWithMatchers === null) {
      return;
    }

    // diffStats tells you what's already been merged in github, but hasn't yet been synced to G3
    const diffStats = await getDiffStats(config, g3SyncConfigWithMatchers.config, gitClient);
    if (diffStats === undefined) {
      return;
    }

    const hasSeparateSyncFiles = await PullRequestFiles.create(
      gitClient,
      prNumber,
      g3SyncConfigWithMatchers.config,
    ).pullRequestHasSeparateFiles();

    // This validation applies to PRs that get merged when changes have not yet been synced into G3.
    // The rules are as follows:
    //   1. if pure framework changes have been merged, separate file changes should not be merged.
    //   2. if separate file changes have been merged, pure framework changes should not be merged.
    //   3. if separate file changes have been merged, any change merged MUST have separate file changes in it.
    //   4. framework changes can be merged with separate file changes as long as that change ALSO
    //       has separate file changes also.

    // covers 2 & 3
    if (diffStats.separateFiles > 0 && !hasSeparateSyncFiles) {
      throw this._createError(
        `This PR cannot be merged as Shared Primitives code has already been merged. ` +
          `Primitives and Framework code must be merged and synced separately. Try again after a g3sync has finished.`,
      );
    }

    // covers 1 & 4
    if (diffStats.files > 0 && diffStats.separateFiles === 0 && hasSeparateSyncFiles) {
      throw this._createError(
        `This PR cannot be merged as Angular framework code has already been merged. ` +
          `Primitives and Framework code must be merged and synced separately. Try again after a g3sync has finished.`,
      );
    }
  }
}

async function getGsyncConfig(
  config: CaretakerConfig,
  git: AuthenticatedGitClient,
): Promise<{
  ngMatchFn: SyncFileMatchFn;
  separateMatchFn: SyncFileMatchFn;
  config: GoogleSyncConfig;
} | null> {
  let googleSyncConfig = null;
  if (config.g3SyncConfigPath) {
    try {
      const configPath = path.join(git.baseDir, config.g3SyncConfigPath);
      googleSyncConfig = await getGoogleSyncConfig(configPath);
    } catch {}
  }
  return googleSyncConfig;
}

export class PullRequestFiles {
  constructor(
    private git: AuthenticatedGitClient,
    private prNumber: number,
    private config: GoogleSyncConfig,
  ) {}
  /**
   * Loads the files from a given pull request.
   */
  async loadPullRequestFiles(): Promise<string[]> {
    const files = await fetchPullRequestFilesFromGithub(this.git, this.prNumber);
    return files?.map((x) => x.path) ?? [];
  }

  /**
   * checks for separate files against the pull request files
   */
  async pullRequestHasSeparateFiles(): Promise<boolean> {
    const pullRequestFiles = await this.loadPullRequestFiles();
    const separateFilePatterns = this.config.separateFilePatterns.map((p) => new Minimatch(p));
    for (let path of pullRequestFiles) {
      if (separateFilePatterns.some((p) => p.match(path))) {
        return true;
      }
    }
    return false;
  }

  static create(git: AuthenticatedGitClient, prNumber: number, config: GoogleSyncConfig) {
    return new PullRequestFiles(git, prNumber, config);
  }
}

async function getDiffStats(
  ngDevConfig: NgDevConfig<{
    github: GithubConfig;
    caretaker: CaretakerConfig;
  }>,
  googleSyncConfig: GoogleSyncConfig,
  git: AuthenticatedGitClient,
): Promise<G3StatsData | undefined> {
  if (googleSyncConfig && googleSyncConfig.separateFilePatterns.length > 0) {
    return G3Stats.retrieveDiffStats(git, {
      caretaker: ngDevConfig.caretaker,
      github: ngDevConfig.github,
    });
  }
  return;
}
