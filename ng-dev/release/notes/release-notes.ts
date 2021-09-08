/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {render} from 'ejs';
import * as semver from 'semver';
import {CommitFromGitLog} from '../../commit-message/parse';

import {promptInput} from '../../utils/console';
import {formatFiles} from '../../format/format';
import {GitClient} from '../../utils/git/git-client';
import {assertValidReleaseConfig, ReleaseConfig} from '../config/index';
import {RenderContext} from './context';

import changelogTemplate from './templates/changelog';
import githubReleaseTemplate from './templates/github-release';
import {getCommitsForRangeWithDeduping} from './commits/get-commits-in-range';
import {getConfig} from '../../utils/config';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {assertValidFormatConfig} from '../../format/config';

/** Project-relative path for the changelog file. */
export const changelogPath = 'CHANGELOG.md';

/** Release note generation. */
export class ReleaseNotes {
  static async forRange(version: semver.SemVer, baseRef: string, headRef: string) {
    const git = GitClient.get();
    const commits = getCommitsForRangeWithDeduping(git, baseRef, headRef);
    return new ReleaseNotes(version, commits, git);
  }

  /** The absolute path to the changelog file. */
  private changelogPath = join(this.git.baseDir, changelogPath);
  /** The RenderContext to be used during rendering. */
  private renderContext: RenderContext | undefined;
  /** The title to use for the release. */
  private title: string | false | undefined;
  /** The configuration ng-dev. */
  private config: {release: ReleaseConfig} = getConfig([assertValidReleaseConfig]);
  /** The configuration for the release notes. */
  private get notesConfig() {
    return this.config.release.releaseNotes ?? {};
  }

  protected constructor(
    public version: semver.SemVer,
    private commits: CommitFromGitLog[],
    private git: GitClient,
  ) {}

  /** Retrieve the release note generated for a Github Release. */
  async getGithubReleaseEntry(): Promise<string> {
    return render(githubReleaseTemplate, await this.generateRenderContext(), {
      rmWhitespace: true,
    });
  }

  /** Retrieve the release note generated for a CHANGELOG entry. */
  async getChangelogEntry() {
    return render(changelogTemplate, await this.generateRenderContext(), {rmWhitespace: true});
  }

  /**
   * Prepend generated release note to the CHANGELOG.md file in the base directory of the repository
   * provided by the GitClient.
   */
  async prependEntryToChangelog() {
    /** The changelog contents in the current changelog. */
    let changelog = '';
    if (existsSync(this.changelogPath)) {
      changelog = readFileSync(this.changelogPath, {encoding: 'utf8'});
    }
    /** The new changelog entry to add to the changelog. */
    const entry = await this.getChangelogEntry();

    writeFileSync(this.changelogPath, `${entry}\n\n${changelog}`);

    // TODO(josephperrott): Remove file formatting calls.
    //   Upon reaching a standardized formatting for markdown files, rather than calling a formatter
    //   for all creation of changelogs, we instead will confirm in our testing that the new changes
    //   created for changelogs meet on standardized markdown formats via unit testing.
    try {
      assertValidFormatConfig(this.config);
      await formatFiles([this.changelogPath]);
    } catch {
      // If the formatting is either unavailable or fails, continue on with the unformatted result.
    }
  }

  /** Retrieve the number of commits included in the release notes after filtering and deduping. */
  async getCommitCountInReleaseNotes() {
    const context = await this.generateRenderContext();
    return context.commits.filter(context.includeInReleaseNotes()).length;
  }

  /**
   * Gets the URL fragment for the release notes. The URL fragment identifier
   * can be used to point to a specific changelog entry through an URL.
   */
  async getUrlFragmentForRelease() {
    return (await this.generateRenderContext()).urlFragmentForRelease;
  }

  /**
   * Prompt the user for a title for the release, if the project's configuration is defined to use a
   * title.
   */
  async promptForReleaseTitle() {
    if (this.title === undefined) {
      if (this.notesConfig.useReleaseTitle) {
        this.title = await promptInput('Please provide a title for the release:');
      } else {
        this.title = false;
      }
    }
    return this.title;
  }

  /** Build the render context data object for constructing the RenderContext instance. */
  private async generateRenderContext(): Promise<RenderContext> {
    if (!this.renderContext) {
      this.renderContext = new RenderContext({
        commits: this.commits,
        github: this.git.remoteConfig,
        version: this.version.format(),
        groupOrder: this.notesConfig.groupOrder,
        hiddenScopes: this.notesConfig.hiddenScopes,
        categorizeCommit: this.notesConfig.categorizeCommit,
        title: await this.promptForReleaseTitle(),
      });
    }
    return this.renderContext;
  }
}
