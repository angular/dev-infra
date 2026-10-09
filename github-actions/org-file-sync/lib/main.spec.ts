import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {
  assertValidCommitSha,
  getFile,
  getFilesForRepo,
  updateRepoWithFiles,
  runOrgFileSync,
} from './main.js';

describe('org-file-sync main', () => {
  const sourceRepo = 'dev-infra';
  const targetRepo = 'angular';
  const filesToSync = ['.github/workflows/ci.yml', '.github/ISSUE_TEMPLATE.md'];
  const testSha = 'abcdef0123456789abcdef0123456789abcdef01';

  let mockOctokit: jasmine.SpyObj<Octokit>;
  let getContentSpy: jasmine.Spy;
  let createOrUpdateFileContentsSpy: jasmine.Spy;

  beforeEach(() => {
    process.env['GITHUB_REPOSITORY'] = `angular/${sourceRepo}`;
    Object.defineProperty(context, 'sha', {value: testSha, configurable: true, writable: true});

    getContentSpy = jasmine.createSpy('getContent');
    createOrUpdateFileContentsSpy = jasmine.createSpy('createOrUpdateFileContents');

    mockOctokit = {
      rest: {
        repos: {
          getContent: getContentSpy,
        },
      },
      repos: {
        createOrUpdateFileContents: createOrUpdateFileContentsSpy,
      },
    } as any;
  });

  describe('assertValidCommitSha', () => {
    it('accepts valid 40-character hex commit SHAs', () => {
      expect(() => assertValidCommitSha('abcdef0123456789abcdef0123456789abcdef01')).not.toThrow();
      expect(() => assertValidCommitSha('0123456789ABCDEF0123456789ABCDEF01234567')).not.toThrow();
    });

    it('rejects invalid or empty commit SHAs', () => {
      expect(() => assertValidCommitSha('')).toThrowError(/Invalid or missing context.sha/);
      expect(() => assertValidCommitSha(undefined)).toThrowError(/Invalid or missing context.sha/);
      expect(() => assertValidCommitSha(null)).toThrowError(/Invalid or missing context.sha/);
      expect(() => assertValidCommitSha('main')).toThrowError(/Invalid or missing context.sha/);
      expect(() => assertValidCommitSha('1234567')).toThrowError(/Invalid or missing context.sha/);
      expect(() => assertValidCommitSha(' abcdef0123456789abcdef0123456789abcdef01 ')).toThrowError(
        /Invalid or missing context.sha/,
      );
      expect(() => assertValidCommitSha('abcdef0123456789abcdef0123456789abcdef01\n')).toThrowError(
        /Invalid or missing context.sha/,
      );
      expect(() =>
        assertValidCommitSha('abcdef0123456789abcdef0123456789abcdef01\nmalicious'),
      ).toThrowError(/Invalid or missing context.sha/);
    });
  });

  describe('getFile', () => {
    it('passes ref parameter when ref is provided', async () => {
      getContentSpy.and.resolveTo({
        data: {
          sha: 'file-sha-1',
          content: Buffer.from('file-content-1').toString('base64'),
        },
      });

      const file = await getFile(mockOctokit, sourceRepo, '.github/workflows/ci.yml', testSha);

      expect(file).toEqual({
        sha: 'file-sha-1',
        content: Buffer.from('file-content-1').toString('base64'),
      });
      expect(getContentSpy).toHaveBeenCalledWith({
        owner: 'angular',
        repo: sourceRepo,
        path: '.github/workflows/ci.yml',
        ref: testSha,
      });
    });

    it('omits ref parameter when ref is undefined', async () => {
      getContentSpy.and.resolveTo({
        data: {
          sha: 'file-sha-2',
          content: Buffer.from('file-content-2').toString('base64'),
        },
      });

      const file = await getFile(mockOctokit, targetRepo, '.github/workflows/ci.yml');

      expect(file).toEqual({
        sha: 'file-sha-2',
        content: Buffer.from('file-content-2').toString('base64'),
      });
      expect(getContentSpy).toHaveBeenCalledWith({
        owner: 'angular',
        repo: targetRepo,
        path: '.github/workflows/ci.yml',
      });
    });

    it('handles 404 cleanly by returning null', async () => {
      const error: any = new Error('Not found');
      error.status = 404;
      getContentSpy.and.rejectWith(error);

      const file = await getFile(mockOctokit, targetRepo, '.github/missing.yml');

      expect(file).toBeNull();
    });

    it('rethrows non-404 errors', async () => {
      const error: any = new Error('Server error');
      error.status = 500;
      getContentSpy.and.rejectWith(error);

      await expectAsync(
        getFile(mockOctokit, targetRepo, '.github/workflows/ci.yml'),
      ).toBeRejectedWith(error);
    });
  });

  describe('getFilesForRepo', () => {
    it('retrieves all files with specified ref', async () => {
      getContentSpy.and.callFake(async (params: any) => ({
        data: {
          sha: `sha-${params.path}`,
          content: `content-${params.path}`,
        },
      }));

      const files = await getFilesForRepo(mockOctokit, sourceRepo, filesToSync, testSha);

      expect(files.size).toBe(2);
      expect(getContentSpy).toHaveBeenCalledWith({
        owner: 'angular',
        repo: sourceRepo,
        path: filesToSync[0],
        ref: testSha,
      });
      expect(getContentSpy).toHaveBeenCalledWith({
        owner: 'angular',
        repo: sourceRepo,
        path: filesToSync[1],
        ref: testSha,
      });
    });
  });

  describe('updateRepoWithFiles', () => {
    it('updates file in target repo when content differs from golden file', async () => {
      const goldenFiles = new Map<string, any>([
        ['file1.txt', {sha: 'golden-sha-1', content: 'new-content'}],
      ]);

      // Mock target repo having old content
      getContentSpy.and.resolveTo({
        data: {
          sha: 'target-old-sha',
          content: 'old-content',
        },
      });
      createOrUpdateFileContentsSpy.and.resolveTo({});

      await updateRepoWithFiles(mockOctokit, targetRepo, goldenFiles, ['file1.txt']);

      expect(createOrUpdateFileContentsSpy).toHaveBeenCalledWith({
        content: 'new-content',
        owner: 'angular',
        repo: targetRepo,
        path: 'file1.txt',
        message: 'build: update `file1.txt` to match the content of `angular/dev-infra`',
        sha: 'target-old-sha',
      });
    });

    it('skips update when target file content already matches golden file', async () => {
      const goldenFiles = new Map<string, any>([
        ['file1.txt', {sha: 'golden-sha-1', content: 'identical-content'}],
      ]);

      getContentSpy.and.resolveTo({
        data: {
          sha: 'target-sha',
          content: 'identical-content',
        },
      });

      await updateRepoWithFiles(mockOctokit, targetRepo, goldenFiles, ['file1.txt']);

      expect(createOrUpdateFileContentsSpy).not.toHaveBeenCalled();
    });
  });

  describe('runOrgFileSync', () => {
    it('pins context.sha when reading source files and updates target repo without ref', async () => {
      getContentSpy.and.callFake(async (params: any) => {
        if (params.repo === sourceRepo) {
          return {
            data: {
              sha: 'source-sha',
              content: 'latest-source-content',
            },
          };
        }
        return {
          data: {
            sha: 'target-sha',
            content: 'old-target-content',
          },
        };
      });
      createOrUpdateFileContentsSpy.and.resolveTo({});

      await runOrgFileSync([targetRepo], ['.github/workflows/ci.yml'], testSha, mockOctokit);

      // Verify source call used pinned SHA
      expect(getContentSpy).toHaveBeenCalledWith({
        owner: 'angular',
        repo: sourceRepo,
        path: '.github/workflows/ci.yml',
        ref: testSha,
      });

      // Verify target call did NOT specify ref
      expect(getContentSpy).toHaveBeenCalledWith({
        owner: 'angular',
        repo: targetRepo,
        path: '.github/workflows/ci.yml',
      });

      // Verify target update was executed
      expect(createOrUpdateFileContentsSpy).toHaveBeenCalledWith({
        content: 'latest-source-content',
        owner: 'angular',
        repo: targetRepo,
        path: '.github/workflows/ci.yml',
        message:
          'build: update `.github/workflows/ci.yml` to match the content of `angular/dev-infra`',
        sha: 'target-sha',
      });
    });

    it('fails closed when sha is invalid or malformed', async () => {
      await expectAsync(
        runOrgFileSync([targetRepo], ['.github/workflows/ci.yml'], 'not-a-valid-sha', mockOctokit),
      ).toBeRejectedWithError(/Invalid or missing context.sha/);

      expect(getContentSpy).not.toHaveBeenCalled();
      expect(createOrUpdateFileContentsSpy).not.toHaveBeenCalled();
    });
  });
});
