import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {main} from './main.js';

describe('google-internal-tests action', () => {
  let mockGit: jasmine.SpyObj<Octokit>;
  let existingStatuses: Array<{context: string; state: string; target_url?: string | null}>;
  let prFiles: Array<{filename: string; status?: string; previous_filename?: string}>;
  const mockSyncConfig = {
    config: {
      syncedFilePatterns: ['packages/**'],
      alwaysExternalFilePatterns: [],
      separateFilePatterns: ['goldens/**'],
    },
    ngMatchFn: (p: string) => p.startsWith('packages/'),
    separateMatchFn: (p: string) => p.startsWith('goldens/'),
  };

  beforeEach(() => {
    process.env['INPUT_RUN-TESTS-GUIDE-URL'] = 'https://goo.gle/angular-internal-presubmit';
    existingStatuses = [];
    prFiles = [];

    context.eventName = 'pull_request_target';
    context.payload = {
      pull_request: {
        number: 100,
        head: {sha: 'deadbeef1234567890'},
        base: {ref: 'main'},
      },
    };
    spyOnProperty(context, 'repo', 'get').and.returnValue({
      owner: 'angular',
      repo: 'angular',
    });

    mockGit = jasmine.createSpyObj('Octokit', ['paginate', 'repos', 'pulls']);
    mockGit.repos = jasmine.createSpyObj('repos', [
      'createCommitStatus',
      'getCombinedStatusForRef',
    ]);
    mockGit.pulls = jasmine.createSpyObj('pulls', ['listFiles']);

    (mockGit.repos.createCommitStatus as unknown as jasmine.Spy).and.resolveTo({});
    (mockGit.paginate as jasmine.Spy).and.callFake((fn: unknown) => {
      if (fn === mockGit.repos.getCombinedStatusForRef) {
        return Promise.resolve(existingStatuses);
      }
      if (fn === mockGit.pulls.listFiles) {
        return Promise.resolve(prFiles);
      }
      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    delete process.env['INPUT_RUN-TESTS-GUIDE-URL'];
  });

  it('should post pending status when a PR targeting main touches synced files', async () => {
    prFiles = [{filename: 'packages/core/src/index.ts'}];

    await main(mockGit as unknown as Octokit, mockSyncConfig);

    expect(mockGit.repos.createCommitStatus).toHaveBeenCalledOnceWith({
      owner: 'angular',
      repo: 'angular',
      state: 'pending',
      description: 'Waiting for tests to start. @Googlers: Initiate a presubmit. See -->',
      target_url: 'https://goo.gle/angular-internal-presubmit',
      context: 'google-internal-tests',
      sha: 'deadbeef1234567890',
    });
  });

  it('should post success status when a PR targeting main does not touch synced files', async () => {
    prFiles = [{filename: 'docs/README.md'}];

    await main(mockGit as unknown as Octokit, mockSyncConfig);

    expect(mockGit.repos.createCommitStatus).toHaveBeenCalledOnceWith({
      owner: 'angular',
      repo: 'angular',
      state: 'success',
      description: 'Does not affect Google.',
      context: 'google-internal-tests',
      sha: 'deadbeef1234567890',
    });
  });

  it('should post skipped success status for PR targeting non-main branch when no status exists', async () => {
    context.payload.pull_request!.base.ref = '18.2.x';

    await main(mockGit as unknown as Octokit, mockSyncConfig);

    expect(mockGit.repos.createCommitStatus).toHaveBeenCalledOnceWith({
      owner: 'angular',
      repo: 'angular',
      state: 'success',
      description: 'Skipped. PR does not target `main` branch',
      context: 'google-internal-tests',
      sha: 'deadbeef1234567890',
    });
  });

  it('should not overwrite an existing status pointing to an internal CL', async () => {
    context.payload.pull_request!.base.ref = '18.2.x';
    existingStatuses = [
      {
        context: 'google-internal-tests',
        state: 'success',
        target_url: 'http://cl/123456789',
      },
    ];

    await main(mockGit as unknown as Octokit, mockSyncConfig);

    expect(mockGit.repos.createCommitStatus).not.toHaveBeenCalled();
  });

  it('should not overwrite an existing pending status when triggered on a non-main branch with the same head SHA', async () => {
    context.payload.pull_request!.base.ref = '18.2.x';
    existingStatuses = [
      {
        context: 'google-internal-tests',
        state: 'pending',
        target_url: 'https://goo.gle/angular-internal-presubmit',
      },
    ];

    await main(mockGit as unknown as Octokit, mockSyncConfig);

    expect(mockGit.repos.createCommitStatus).not.toHaveBeenCalled();
  });

  it('should overwrite a non-CL skipped success status when a PR targeting main with the same SHA touches synced files', async () => {
    context.payload.pull_request!.base.ref = 'main';
    existingStatuses = [
      {
        context: 'google-internal-tests',
        state: 'success',
        target_url: null,
      },
    ];
    prFiles = [{filename: 'packages/core/src/index.ts'}];

    await main(mockGit as unknown as Octokit, mockSyncConfig);

    expect(mockGit.repos.createCommitStatus).toHaveBeenCalledOnceWith({
      owner: 'angular',
      repo: 'angular',
      state: 'pending',
      description: 'Waiting for tests to start. @Googlers: Initiate a presubmit. See -->',
      target_url: 'https://goo.gle/angular-internal-presubmit',
      context: 'google-internal-tests',
      sha: 'deadbeef1234567890',
    });
  });
});
