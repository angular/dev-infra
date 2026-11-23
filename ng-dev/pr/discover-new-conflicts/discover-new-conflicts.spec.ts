/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import nock from 'nock';
import os from 'os';
import path from 'path';
import {GitClient} from '../../utils/git/git-client.js';
import {Log} from '../../utils/logging.js';
import {
  cleanTestTmpDir,
  getMockGitClient,
  installSandboxGitClient,
  mockNgDevConfig,
  runGitInTmpDir,
  testTmpDir,
} from '../../utils/testing/index.js';
import {discoverNewConflictsForPr} from './index.js';

class ExitInterceptError extends Error {
  constructor(public readonly code: number | undefined) {
    super(`process.exit(${code})`);
  }
}

describe('discoverNewConflictsForPr', () => {
  let remoteDir: string;

  beforeEach(() => {
    cleanTestTmpDir();
    remoteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-dev-conflicts-remote-'));
    runGitInTmpDir(['init', '--bare', remoteDir]);

    runGitInTmpDir(['init']);
    runGitInTmpDir(['config', 'user.email', 'caretaker@angular.io']);
    runGitInTmpDir(['config', 'user.name', 'Caretaker']);

    spyOn(process, 'exit').and.callFake(((code?: number) => {
      throw new ExitInterceptError(code);
    }) as never);
  });

  afterEach(() => {
    nock.cleanAll();
    fs.rmSync(remoteDir, {recursive: true, force: true});
  });

  function enableLocalBareRemoteFetch(git: ReturnType<typeof getMockGitClient>) {
    return spyOn(git, 'runGraceful').and.callFake(((args: string[], opts?: any) => {
      const rewritten = args[0] === 'fetch' ? args.filter((arg) => arg !== '--deepen=500') : args;
      return GitClient.prototype.runGraceful.call(git, rewritten, opts);
    }) as any);
  }

  function makePrNode(number: number, headBranch: string, headRefOid: string, title: string) {
    return {
      number,
      title,
      mergeable: 'MERGEABLE',
      updatedAt: '2026-11-23T00:00:00Z',
      headRefOid,
      headRef: {
        name: headBranch,
        repository: {
          url: remoteDir,
          nameWithOwner: 'contributor/name',
        },
      },
      baseRef: {
        name: 'main',
        repository: {
          url: remoteDir,
          nameWithOwner: 'owner/name',
        },
      },
    };
  }

  it('exits before checkout when the requested PR touches node_modules/ in an intermediate commit', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    installSandboxGitClient(git);

    fs.writeFileSync(path.join(testTmpDir, 'SHARED.txt'), 'line 1\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', 'SHARED.txt']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'main:main']);

    runGitInTmpDir(['checkout', '-B', 'pr-1', baseSha]);
    const disallowedDir = path.join(testTmpDir, 'node_modules', '.bin');
    fs.mkdirSync(disallowedDir, {recursive: true});
    fs.writeFileSync(path.join(disallowedDir, 'tool'), '#!/bin/sh\n');
    runGitInTmpDir(['add', '-f', 'node_modules/.bin/tool']);
    runGitInTmpDir(['commit', '-m', 'feat: add local file']);
    runGitInTmpDir(['rm', '-f', 'node_modules/.bin/tool']);
    fs.writeFileSync(path.join(testTmpDir, 'SHARED.txt'), 'pr 1 change\n');
    runGitInTmpDir(['add', 'SHARED.txt']);
    runGitInTmpDir(['commit', '-m', 'feat: update shared']);
    const pr1Sha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'pr-1:pr-1']);
    runGitInTmpDir(['checkout', 'main']);

    const gitSpy = enableLocalBareRemoteFetch(git);
    const errorSpy = spyOn(Log, 'error');
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequests: {
              nodes: [makePrNode(1, 'pr-1', pr1Sha, 'feat: pr 1')],
              pageInfo: {hasNextPage: false, endCursor: ''},
            },
          },
        },
      });

    await expectAsync(discoverNewConflictsForPr(1, 0)).toBeRejectedWithError(
      ExitInterceptError,
      'process.exit(1)',
    );
    expect(errorSpy).toHaveBeenCalledWith(
      jasmine.stringMatching(/forbidden files under node_modules\//),
    );
    expect(
      gitSpy.calls.allArgs().some(([args]) => args[0] === 'rebase' && args[1] !== '--abort'),
    ).toBeFalse();
    expect(runGitInTmpDir(['rev-parse', '--abbrev-ref', 'HEAD'])).toBe('main');
  });

  it('skips candidate PRs with node_modules/, orphan histories, or moved head SHAs and detects conflicts', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    installSandboxGitClient(git);

    fs.writeFileSync(path.join(testTmpDir, 'SHARED.txt'), 'line 1\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', 'SHARED.txt']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const initialBaseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    // Requested PR #1 branched off initialBaseSha.
    runGitInTmpDir(['checkout', '-B', 'pr-1', initialBaseSha]);
    fs.writeFileSync(path.join(testTmpDir, 'SHARED.txt'), 'pr 1 version\n');
    runGitInTmpDir(['add', 'SHARED.txt']);
    runGitInTmpDir(['commit', '-m', 'feat: pr 1 change']);
    const pr1Sha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'pr-1:pr-1']);

    // Candidate PR #2 touches node_modules/.bin/tool in an intermediate commit.
    runGitInTmpDir(['checkout', '-B', 'pr-2', initialBaseSha]);
    const disallowedDir = path.join(testTmpDir, 'node_modules', '.bin');
    fs.mkdirSync(disallowedDir, {recursive: true});
    fs.writeFileSync(path.join(disallowedDir, 'tool'), '#!/bin/sh\n');
    runGitInTmpDir(['add', '-f', 'node_modules/.bin/tool']);
    runGitInTmpDir(['commit', '-m', 'feat: add local file']);
    runGitInTmpDir(['rm', '-f', 'node_modules/.bin/tool']);
    fs.writeFileSync(path.join(testTmpDir, 'OTHER.txt'), 'pr 2\n');
    runGitInTmpDir(['add', 'OTHER.txt']);
    runGitInTmpDir(['commit', '-m', 'feat: pr 2 change']);
    const pr2Sha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'pr-2:pr-2']);

    // Candidate PR #3 is an orphan branch with no common ancestor with `main`.
    runGitInTmpDir(['checkout', '--orphan', 'pr-orphan']);
    runGitInTmpDir(['rm', '-rf', '.']);
    fs.writeFileSync(path.join(testTmpDir, 'ORPHAN.txt'), 'orphan\n');
    runGitInTmpDir(['add', 'ORPHAN.txt']);
    runGitInTmpDir(['commit', '-m', 'feat: orphan change']);
    const orphanSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'pr-orphan:pr-orphan']);

    // Candidate PR #4 cleanly conflicts with PR #1 on SHARED.txt.
    runGitInTmpDir(['checkout', '-B', 'pr-4', initialBaseSha]);
    fs.writeFileSync(path.join(testTmpDir, 'SHARED.txt'), 'pr 4 conflicting version\n');
    runGitInTmpDir(['add', 'SHARED.txt']);
    runGitInTmpDir(['commit', '-m', 'feat: pr 4 change']);
    const pr4Sha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'pr-4:pr-4']);

    // Advance main on remote so baseTipSha differs from initialBaseSha.
    runGitInTmpDir(['checkout', '-f', 'main']);
    fs.writeFileSync(path.join(testTmpDir, 'MAIN_ADVANCE.txt'), 'main tip\n');
    runGitInTmpDir(['add', 'MAIN_ADVANCE.txt']);
    runGitInTmpDir(['commit', '-m', 'docs: advance main']);
    const baseTipSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'main:main']);

    const gitSpy = enableLocalBareRemoteFetch(git);
    const warnSpy = spyOn(Log, 'warn');
    const errorSpy = spyOn(Log, 'error');
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequests: {
              nodes: [
                makePrNode(1, 'pr-1', pr1Sha, 'feat: pr 1'),
                makePrNode(2, 'pr-2', pr2Sha, 'feat: pr 2'),
                makePrNode(3, 'pr-orphan', orphanSha, 'feat: pr orphan'),
                makePrNode(5, 'pr-4', 'stale-sha-before-push', 'feat: pr stale'),
                makePrNode(4, 'pr-4', pr4Sha, 'feat: pr 4'),
              ],
              pageInfo: {hasNextPage: false, endCursor: ''},
            },
          },
        },
      });

    await expectAsync(discoverNewConflictsForPr(1, 0)).toBeRejectedWithError(
      ExitInterceptError,
      'process.exit(1)',
    );

    expect(runGitInTmpDir(['rev-parse', '--abbrev-ref', 'HEAD'])).toBe('main');
    expect(runGitInTmpDir(['rev-parse', '__NgDevRepoBaseAfterChange__^'])).toBe(baseTipSha);
    expect(warnSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Skipping PR #2:/));
    expect(warnSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Skipping PR #3:/));
    expect(warnSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Skipping PR #5:/));
    expect(
      gitSpy.calls.allArgs().some(([args]) => args[0] === 'checkout' && args.includes(pr2Sha)),
    ).toBeFalse();
    expect(
      gitSpy.calls.allArgs().some(([args]) => args[0] === 'checkout' && args.includes(orphanSha)),
    ).toBeFalse();
    expect(errorSpy).toHaveBeenCalledWith('  - #4: feat: pr 4');
  });
});
