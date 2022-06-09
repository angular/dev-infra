import {existsSync, readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import semver from 'semver';
import {GitClient} from '../../utils/git/git-client';

/** Project-relative path for the changelog file. */
const changelogPath = 'CHANGELOG.md';

/** Project-relative path for the changelog archive file. */
const changelogArchivePath = 'CHANGELOG_ARCHIVE.md';

/** A marker used to split a CHANGELOG.md file into individual entries. */
export const splitMarker = '<!-- CHANGELOG SPLIT MARKER -->';

/**
 * A string to use between each changelog entry when joining them together.
 *
 * Since all every changelog entry's content is trimmed, when joining back together, two new lines
 * must be placed around the splitMarker to create a one line buffer around the comment in the
 * markdown.
 * i.e.
 * <changelog entry content>
 *
 * <!-- CHANGELOG SPLIT MARKER -->
 *
 * <changelog entry content>
 */
const joinMarker = `\n\n${splitMarker}\n\n`;

/** A RegExp matcher to extract the version of a changelog entry from the entry content. */
const versionAnchorMatcher = new RegExp(`<a name="(.*)"></a>`);

/** An individual changelog entry. */
interface ChangelogEntry {
  content: string;
  version: semver.SemVer;
}

export class Changelog {
  /** Prepend a changelog entry to the current changelog file. */
  static prependEntryToChangelogFile(git: GitClient, entry: string) {
    const changelog = new this(git);
    changelog.prependEntryToChangelogFile(entry);
  }

  /**
   * Move all changelog entries from the CHANGELOG.md file for versions prior to the provided
   * version to the changelog archive.
   *
   * Versions should be used to determine which entries are moved to archive as versions are the
   * most accurate piece of context found within a changelog entry to determine its relationship to
   * other changelog entries.  This allows for example, moving all changelog entries out of the
   * main changelog when a version moves out of support.
   */
  static moveEntriesPriorToVersionToArchive(git: GitClient, version: semver.SemVer) {
    const changelog = new this(git);
    changelog.moveEntriesPriorToVersionToArchive(version);
  }

  /**
   * Remove all changelog entries from the CHANGELOG.md file for versions which are prereleases
   * for the provided version. This is expected to be done on each major and minor release to remove
   * the changelog entries which will be made redundant by the first major/minor changelog for a
   * version.
   */
  static removePrereleaseEntriesForVersion(git: GitClient, version: semver.SemVer) {
    const changelog = new this(git);
    changelog.removePrereleaseEntriesForVersion(version);
  }

  // TODO(josephperrott): Remove this after it is unused.
  /** Retrieve the file paths for the changelog files. */
  static getChangelogFilePaths(git: GitClient) {
    return new this(git);
  }

  /** The absolute path to the changelog file. */
  readonly filePath = join(this.git.baseDir, changelogPath);
  /** The absolute path to the changelog archive file. */
  readonly archiveFilePath = join(this.git.baseDir, changelogArchivePath);
  /**
   * The changelog entries in the CHANGELOG.md file.
   * Delays reading the CHANGELOG.md file until it is actually used.
   */
  private get entries() {
    if (this._entries === undefined) {
      return (this._entries = this.getEntriesFor(this.filePath));
    }
    return this._entries;
  }
  private _entries: undefined | ChangelogEntry[] = undefined;
  /**
   * The changelog entries in the CHANGELOG_ARCHIVE.md file.
   * Delays reading the CHANGELOG_ARCHIVE.md file until it is actually used.
   */
  private get archiveEntries() {
    if (this._archiveEntries === undefined) {
      return (this._archiveEntries = this.getEntriesFor(this.archiveFilePath));
    }
    return this._archiveEntries;
  }
  private _archiveEntries: undefined | ChangelogEntry[] = undefined;

  private constructor(private git: GitClient) {}

  /** Prepend a changelog entry to the changelog. */
  private prependEntryToChangelogFile(entry: string) {
    this.entries.unshift(parseChangelogEntry(entry));
    this.writeToChangelogFile();
  }

  /**
   * Remove all changelog entries from the CHANGELOG.md file for versions which are prereleases
   * for the provided version. This is expected to be done on each major and minor release to remove
   * the changelog entries which will be made redundant by the first major/minor changelog for a
   * version.
   */
  private removePrereleaseEntriesForVersion(version: semver.SemVer) {
    this._entries = this.entries.filter((entry: ChangelogEntry) => {
      return semver.diff(entry.version, version) !== 'prerelease';
    });
    this.writeToChangelogFile();
  }

  /**
   * Move all changelog entries from the CHANGELOG.md file for versions prior to the provided
   * version to the changelog archive.
   *
   * Versions should be used to determine which entries are moved to archive as versions are the
   * most accurate piece of context found within a changelog entry to determine its relationship to
   * other changelog entries.  This allows for example, moving all changelog entries out of the
   * main changelog when a version moves out of support.
   */
  private moveEntriesPriorToVersionToArchive(version: semver.SemVer) {
    [...this.entries].reverse().forEach((entry: ChangelogEntry) => {
      if (semver.lt(entry.version, version)) {
        this.archiveEntries.unshift(entry);
        this.entries.splice(this.entries.indexOf(entry), 1);
      }
    });

    this.writeToChangelogFile();
    if (this.archiveEntries.length) {
      this.writeToChangelogArchiveFile();
    }
  }

  /** Update the changelog archive file with the known changelog archive entries. */
  private writeToChangelogArchiveFile(): void {
    const changelogArchive = this.archiveEntries.map((entry) => entry.content).join(joinMarker);
    writeFileSync(this.archiveFilePath, changelogArchive);
  }

  /** Update the changelog file with the known changelog entries. */
  private writeToChangelogFile(): void {
    const changelog = this.entries.map((entry) => entry.content).join(joinMarker);
    writeFileSync(this.filePath, changelog);
  }

  /**
   * Retrieve the changelog entries for the provide changelog path, if the file does not exist an
   * empty array is returned.
   */
  private getEntriesFor(path: string): ChangelogEntry[] {
    if (!existsSync(path)) {
      return [];
    }

    return (
      readFileSync(path, {encoding: 'utf8'})
        // Use the versionMarker as the separator for .split().
        .split(splitMarker)
        // If the `split()` method finds the separator at the beginning or end of a string, it
        // includes an empty string at the respective locaiton, so we filter to remove all of these
        // potential empty strings.
        .filter((entry) => entry.trim().length !== 0)
        // Create a ChangelogEntry for each of the string entry.
        .map(parseChangelogEntry)
    );
  }
}

/** Parse the provided string into a ChangelogEntry object. */
function parseChangelogEntry(content: string): ChangelogEntry {
  const versionMatcherResult = versionAnchorMatcher.exec(content);
  if (versionMatcherResult === null) {
    throw Error(`Unable to determine version for changelog entry: ${content}`);
  }
  const version = semver.parse(versionMatcherResult[1]);

  if (version === null) {
    throw Error(
      `Unable to determine version for changelog entry, with tag: ${versionMatcherResult[1]}`,
    );
  }

  return {
    content: content.trim(),
    version,
  };
}
