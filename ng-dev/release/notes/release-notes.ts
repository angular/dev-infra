/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {render} from 'ejs';
import semver from 'semver';
import {CommitFromGitLog} from '../../commit-message/parse.js';

import {Prompt} from '../../utils/prompt.js';
import {formatFiles} from '../../format/format.js';
import {GitClient} from '../../utils/git/git-client.js';
import {assertValidReleaseConfig, ReleaseConfig} from '../config/index.js';
import {RenderContext} from './context.js';

import changelogTemplate from './templates/changelog.js';
import githubReleaseTemplate from './templates/github-release.js';
import {getCommitsForRangeWithDeduping} from './commits/get-commits-in-range.js';
import {getConfig, NgDevConfig} from '../../utils/config.js';
import {assertValidFormatConfig} from '../../format/config.js';
import {Changelog} from './changelog.js';

/** Workspace-relative path for the changelog file. */
export const workspaceRelativeChangelogPath = 'CHANGELOG.md';

/** Release note generation. */
export class ReleaseNotes {
  static async forRange(git: GitClient, version: semver.SemVer, baseRef: string, headRef: string) {
    const config = await getConfig([assertValidReleaseConfig]);
    const commits = getCommitsForRangeWithDeduping(git, baseRef, headRef);
    return new ReleaseNotes(config, version, commits, git);
  }

  /** The RenderContext to be used during rendering. */
  private renderContext: RenderContext | undefined;

  /** The title to use for the release. */
  private title: string | false | undefined;

  protected constructor(
    public config: NgDevConfig<{release: ReleaseConfig}>,
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
   * provided by the GitClient. Removes entries for related prerelease entries as appropriate.
   */
  async prependEntryToChangelogFile() {
    // When the version for the entry is a non-prelease (i.e. 1.0.0 rather than 1.0.0-next.1), the
    // pre-release entries for the version should be removed from the changelog.
    if (semver.prerelease(this.version) === null) {
      Changelog.removePrereleaseEntriesForVersion(this.git, this.version);
    }
    Changelog.prependEntryToChangelogFile(this.git, await this.getChangelogEntry());

    // TODO(josephperrott): Remove file formatting calls.
    //   Upon reaching a standardized formatting for markdown files, rather than calling a formatter
    //   for all creation of changelogs, we instead will confirm in our testing that the new changes
    //   created for changelogs meet on standardized markdown formats via unit testing.
    try {
      assertValidFormatConfig(await this.config);
      await formatFiles([Changelog.getChangelogFilePaths(this.git).filePath]);
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
    const notesConfig = await this._getNotesConfig();

    if (this.title === undefined) {
      if (notesConfig.useReleaseTitle) {
        this.title = await Prompt.input('Please provide a title for the release:');
      } else {
        this.title = false;
      }
    }
    return this.title;
  }

  /** Build the render context data object for constructing the RenderContext instance. */
  private async generateRenderContext(): Promise<RenderContext> {
    const notesConfig = await this._getNotesConfig();

    if (!this.renderContext) {
      this.renderContext = new RenderContext({
        commits: this.commits,
        github: this.git.remoteConfig,
        version: this.version.format(),
        groupOrder: notesConfig.groupOrder,
        hiddenScopes: notesConfig.hiddenScopes,
        categorizeCommit: notesConfig.categorizeCommit,
        title: await this.promptForReleaseTitle(),
      });
    }
    return this.renderContext;
  }

  /** Gets the configuration for the release notes. */
  private async _getNotesConfig() {
    return (await this.config).release.releaseNotes ?? {};
  }
}
