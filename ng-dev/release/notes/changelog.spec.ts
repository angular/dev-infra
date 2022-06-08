import {existsSync, readFileSync} from 'fs';
import {GitClient} from '../../utils/git/git-client.js';
import semver from 'semver';
import {dedent} from '../../utils/testing/index.js';
import {Changelog, splitMarker} from './changelog.js';
import {getMockGitClient} from '../../utils/testing/index.js';

describe('Changelog', () => {
  let changelog: Changelog;
  let gitClient: GitClient;

  beforeEach(() => {
    gitClient = getMockGitClient(
      {owner: 'angular', name: 'dev-infra-test', mainBranchName: 'main'},
      /* useSandboxGitClient */ false,
    );
    spyOn(GitClient, 'get').and.returnValue(gitClient);
    changelog = Changelog.getChangelogFilePaths(gitClient);
  });

  it('throws an error if it cannot find the anchor containing the version for an entry', () => {
    expect(() =>
      Changelog.prependEntryToChangelogFile(gitClient, 'does not have version <a> tag'),
    ).toThrow();
  });

  it('throws an error if it cannot determine the version for an entry', () => {
    expect(() =>
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('NotSemVer')),
    ).toThrow();
  });

  it('concatenates the changelog entries into the changelog file with the split marker between', () => {
    Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('1.0.0'));
    Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('2.0.0'));
    Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('3.0.0'));

    expect(readFileAsString(changelog.filePath)).toBe(
      dedent`
    <a name="3.0.0"></a>

    ${splitMarker}

    <a name="2.0.0"></a>

    ${splitMarker}

    <a name="1.0.0"></a>
    `.trim(),
    );

    Changelog.moveEntriesPriorToVersionToArchive(gitClient, new semver.SemVer('3.0.0'));

    expect(readFileAsString(changelog.archiveFilePath)).toBe(
      dedent`
    <a name="2.0.0"></a>

    ${splitMarker}

    <a name="1.0.0"></a>
    `.trim(),
    );

    expect(readFileAsString(changelog.filePath)).toBe(`<a name="3.0.0"></a>`);
  });

  describe('adds entries to the changelog', () => {
    it('creates a new changelog file if one does not exist.', () => {
      expect(existsSync(changelog.filePath)).toBe(false);

      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('0.0.0'));
      expect(existsSync(changelog.filePath)).toBe(true);
    });

    it('should not include a split marker when only one changelog entry is in the changelog.', () => {
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('0.0.0'));

      expect(readFileAsString(changelog.filePath)).not.toContain(splitMarker);
    });

    it('separates multiple changelog entries using a standard split marker', () => {
      for (let i = 0; i < 2; i++) {
        Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry(`0.0.${i}`));
      }

      expect(readFileAsString(changelog.filePath)).toContain(splitMarker);
    });
  });

  describe('adds entries to the changelog archive', () => {
    it('only updates or creates the changelog archive if necessary', () => {
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('1.0.0'));
      expect(existsSync(changelog.archiveFilePath)).toBe(false);

      Changelog.moveEntriesPriorToVersionToArchive(gitClient, new semver.SemVer('1.0.0'));
      expect(existsSync(changelog.archiveFilePath)).toBe(false);

      Changelog.moveEntriesPriorToVersionToArchive(gitClient, new semver.SemVer('2.0.0'));
      expect(existsSync(changelog.archiveFilePath)).toBe(true);
    });

    it('from the primary changelog older than a provided version', () => {
      Changelog.prependEntryToChangelogFile(
        gitClient,
        createChangelogEntry('1.0.0', 'This is version 1'),
      );
      Changelog.prependEntryToChangelogFile(
        gitClient,
        createChangelogEntry('2.0.0', 'This is version 2'),
      );
      Changelog.prependEntryToChangelogFile(
        gitClient,
        createChangelogEntry('3.0.0', 'This is version 3'),
      );

      Changelog.moveEntriesPriorToVersionToArchive(gitClient, new semver.SemVer('3.0.0'));
      expect(readFileAsString(changelog.archiveFilePath)).toContain('version 1');
      expect(readFileAsString(changelog.archiveFilePath)).toContain('version 2');
      expect(readFileAsString(changelog.archiveFilePath)).not.toContain('version 3');
    });
  });

  describe('removes entries for all prereleases of major or minor versions', () => {
    it('only removes the prerelease entries from the matching minor versions', () => {
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('1.0.0-next.0'));
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('1.0.0'));
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('1.1.0-next.0'));
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('1.1.0-rc.0'));

      Changelog.removePrereleaseEntriesForVersion(gitClient, new semver.SemVer('1.1.0'));
      expect(readFileAsString(changelog.filePath)).toContain('1.0.0-next.0');
      expect(readFileAsString(changelog.filePath)).toContain('1.0.0');
      expect(readFileAsString(changelog.filePath)).not.toContain('1.1.0-next.0');
      expect(readFileAsString(changelog.filePath)).not.toContain('1.1.0-rc.0');
    });

    it('only removes the prerelease entries from the matching major versions', () => {
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('1.0.0-next.0'));
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('1.0.0'));
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('2.0.0-next.0'));
      Changelog.prependEntryToChangelogFile(gitClient, createChangelogEntry('2.0.0-rc.0'));

      Changelog.removePrereleaseEntriesForVersion(gitClient, new semver.SemVer('2.0.0'));
      expect(readFileAsString(changelog.filePath)).toContain('1.0.0-next.0');
      expect(readFileAsString(changelog.filePath)).toContain('1.0.0');
      expect(readFileAsString(changelog.filePath)).not.toContain('2.0.0-next.0');
      expect(readFileAsString(changelog.filePath)).not.toContain('2.0.0-rc.0');
    });
  });
});

function readFileAsString(file: string) {
  return readFileSync(file, {encoding: 'utf8'});
}

function createChangelogEntry(version: string, content = '') {
  return dedent`
    <a name="${version}"></a>
    ${content}
    `;
}
