import {existsSync, readFileSync} from 'fs';
import {SemVer} from 'semver';
import {dedent} from '../../utils/testing/dedent';
import {getMockGitClient} from '../publish/test/test-utils/git-client-mock';
import {Changelog, splitMarker} from './changelog';

describe('Changelog', () => {
  let changelog: Changelog;

  beforeEach(() => {
    const gitClient = getMockGitClient(
      {owner: 'angular', name: 'dev-infra-test', mainBranchName: 'main'},
      /* useSandboxGitClient */ false,
    );
    changelog = new Changelog(gitClient);
  });

  it('throws an error if it cannot find the anchor containing the version for an entry', () => {
    expect(() => changelog.prependEntryToChangelog('does not have version <a> tag')).toThrow();
  });

  it('throws an error if it cannot determine the version for an entry', () => {
    expect(() => changelog.prependEntryToChangelog(createChangelogEntry('NotSemVer'))).toThrow();
  });

  it('concatenates the changelog entries into the changelog file with the split marker between', () => {
    changelog.prependEntryToChangelog(createChangelogEntry('1.0.0'));
    changelog.prependEntryToChangelog(createChangelogEntry('2.0.0'));
    changelog.prependEntryToChangelog(createChangelogEntry('3.0.0'));

    expect(readFileAsString(changelog.filePath)).toBe(
      dedent`
    <a name="3.0.0"></a>

    ${splitMarker}

    <a name="2.0.0"></a>

    ${splitMarker}

    <a name="1.0.0"></a>
    `.trim(),
    );

    changelog.moveEntriesPriorToVersionToArchive(new SemVer('3.0.0'));

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

      changelog.prependEntryToChangelog(createChangelogEntry('0.0.0'));
      expect(existsSync(changelog.filePath)).toBe(true);
    });

    it('should not include a split marker when only one changelog entry is in the changelog.', () => {
      changelog.prependEntryToChangelog(createChangelogEntry('0.0.0'));

      expect(readFileAsString(changelog.filePath)).not.toContain(splitMarker);
    });

    it('separates multiple changelog entries using a standard split marker', () => {
      for (let i = 0; i < 2; i++) {
        changelog.prependEntryToChangelog(createChangelogEntry(`0.0.${i}`));
      }

      expect(readFileAsString(changelog.filePath)).toContain(splitMarker);
    });
  });

  describe('adds entries to the changelog archive', () => {
    it('only updates or creates the changelog archive if necessary', () => {
      changelog.prependEntryToChangelog(createChangelogEntry('1.0.0'));
      expect(existsSync(changelog.archiveFilePath)).toBe(false);

      changelog.moveEntriesPriorToVersionToArchive(new SemVer('1.0.0'));
      expect(existsSync(changelog.archiveFilePath)).toBe(false);

      changelog.moveEntriesPriorToVersionToArchive(new SemVer('2.0.0'));
      expect(existsSync(changelog.archiveFilePath)).toBe(true);
    });

    it('from the primary changelog older than a provided version', () => {
      changelog.prependEntryToChangelog(createChangelogEntry('1.0.0', 'This is version 1'));
      changelog.prependEntryToChangelog(createChangelogEntry('2.0.0', 'This is version 2'));
      changelog.prependEntryToChangelog(createChangelogEntry('3.0.0', 'This is version 3'));

      changelog.moveEntriesPriorToVersionToArchive(new SemVer('3.0.0'));
      expect(readFileAsString(changelog.archiveFilePath)).toContain('version 1');
      expect(readFileAsString(changelog.archiveFilePath)).toContain('version 2');
      expect(readFileAsString(changelog.archiveFilePath)).not.toContain('version 3');
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
