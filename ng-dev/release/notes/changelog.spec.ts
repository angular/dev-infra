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

  describe('adds entries to the changelog', () => {
    it('creating a new changelog file if one does not exist.', () => {
      expect(existsSync(changelog.changelogPath)).toBe(false);

      changelog.prependEntryToChangelog(createChangelogEntry('0.0.0'));
      expect(existsSync(changelog.changelogPath)).toBe(true);
    });

    it('not including a split marker when only one changelog entry is in the changelog.', () => {
      changelog.prependEntryToChangelog(createChangelogEntry('0.0.0'));

      expect(readFileAsString(changelog.changelogPath)).not.toContain(splitMarker);
    });

    it('separating multiple changelog entries with a standard split marker', () => {
      for (let i = 0; i < 2; i++) {
        changelog.prependEntryToChangelog(createChangelogEntry(`0.0.${i}`));
      }

      expect(readFileAsString(changelog.changelogPath)).toContain(splitMarker);
    });
  });

  describe('adds entries to the changelog archive', () => {
    it('only updating or creating the changelog archive if necessary', () => {
      changelog.prependEntryToChangelog(createChangelogEntry('1.0.0'));
      expect(existsSync(changelog.changelogArchivePath)).toBe(false);

      changelog.moveEntriesPriorToVersionToArchive(new SemVer('1.0.0'));
      expect(existsSync(changelog.changelogArchivePath)).toBe(false);

      changelog.moveEntriesPriorToVersionToArchive(new SemVer('2.0.0'));
      expect(existsSync(changelog.changelogArchivePath)).toBe(true);
    });

    it('from the primary changelog older than a provided version', () => {
      changelog.prependEntryToChangelog(createChangelogEntry('1.0.0', 'This is version 1'));
      changelog.prependEntryToChangelog(createChangelogEntry('2.0.0', 'This is version 2'));
      changelog.prependEntryToChangelog(createChangelogEntry('3.0.0', 'This is version 3'));

      changelog.moveEntriesPriorToVersionToArchive(new SemVer('3.0.0'));
      expect(readFileAsString(changelog.changelogArchivePath)).toContain('version 1');
      expect(readFileAsString(changelog.changelogArchivePath)).toContain('version 2');
      expect(readFileAsString(changelog.changelogArchivePath)).not.toContain('version 3');
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
