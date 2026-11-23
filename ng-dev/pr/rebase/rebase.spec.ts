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
import {rebasePr} from './index.js';

describe('rebasePr', () => {
  let remoteDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    cleanTestTmpDir();
    remoteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-dev-rebase-remote-'));
    runGitInTmpDir(['init', '--bare', remoteDir]);

    runGitInTmpDir(['init']);
    runGitInTmpDir(['config', 'user.email', 'caretaker@angular.io']);
    runGitInTmpDir(['config', 'user.name', 'Caretaker']);
    process.chdir(testTmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    nock.cleanAll();
    fs.rmSync(remoteDir, {recursive: true, force: true});
  });

  function mockPrGraphql(prNumber: number, headRefOid: string, baseRefOid: string) {
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequest: {
              number: prNumber,
              state: 'OPEN',
              isDraft: false,
              maintainerCanModify: true,
              viewerDidAuthor: false,
              headRefOid,
              baseRefOid,
              baseRefName: 'main',
              title: 'feat: sample pr',
              author: {login: 'contributor'},
              headRef: {
                name: 'pr-branch',
                repository: {
                  url: 'https://github.com/contributor/name.git',
                  nameWithOwner: 'contributor/name',
                },
              },
              baseRef: {
                name: 'main',
                repository: {
                  url: 'https://github.com/owner/name.git',
                  nameWithOwner: 'owner/name',
                },
              },
            },
          },
        },
      });
  }

  function redirectRemoteGitCommands(git: ReturnType<typeof getMockGitClient>) {
    return spyOn(git, 'runGraceful').and.callFake(((args: string[], opts?: any) => {
      if (args[0] === 'fetch') {
        const rewritten = args
          .filter((arg) => arg !== '--deepen=500')
          .map((arg) => (arg.startsWith('https://') ? remoteDir : arg));
        return GitClient.prototype.runGraceful.call(git, rewritten, opts);
      }
      if (args[0] === 'push') {
        const rewritten = args.map((arg) => (arg.startsWith('https://') ? remoteDir : arg));
        return GitClient.prototype.runGraceful.call(git, rewritten, opts);
      }
      return GitClient.prototype.runGraceful.call(git, args, opts);
    }) as any);
  }

  it('aborts and restores the working branch when FETCH_HEAD differs from pr.headRefOid', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    installSandboxGitClient(git);

    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'base\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'main:main']);

    runGitInTmpDir(['checkout', '-B', 'pr-branch', baseSha]);
    fs.writeFileSync(path.join(testTmpDir, 'FEATURE.md'), 'v1\n');
    runGitInTmpDir(['add', 'FEATURE.md']);
    runGitInTmpDir(['commit', '-m', 'feat: add feature v1']);
    const validatedHeadSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    fs.writeFileSync(path.join(testTmpDir, 'FEATURE.md'), 'v2\n');
    runGitInTmpDir(['add', 'FEATURE.md']);
    runGitInTmpDir(['commit', '-m', 'feat: update feature']);
    const updatedHeadSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'pr-branch:pr-branch']);
    runGitInTmpDir(['checkout', 'main']);

    const gitSpy = redirectRemoteGitCommands(git);
    const errorSpy = spyOn(Log, 'error');
    mockPrGraphql(55, validatedHeadSha, baseSha);

    const code = await rebasePr(55);

    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(
      jasmine.stringMatching(/Pull request head commit changed while fetching/),
    );
    expect(runGitInTmpDir(['rev-parse', '--abbrev-ref', 'HEAD'])).toBe('main');
    expect(
      gitSpy.calls
        .allArgs()
        .some(
          ([args]) =>
            args[0] === 'checkout' &&
            (args.includes(updatedHeadSha) || args.includes(validatedHeadSha)),
        ),
    ).toBeFalse();
    expect(
      gitSpy.calls.allArgs().some(([args]) => args[0] === 'rebase' && args[1] !== '--abort'),
    ).toBeFalse();
  });

  it('aborts before checkout or rebase when an intermediate commit touches node_modules/', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    installSandboxGitClient(git);

    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'base\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'main:main']);

    runGitInTmpDir(['checkout', '-B', 'pr-branch', baseSha]);
    const disallowedDir = path.join(testTmpDir, 'node_modules', '.bin');
    fs.mkdirSync(disallowedDir, {recursive: true});
    fs.writeFileSync(path.join(disallowedDir, 'tool'), '#!/bin/sh\n');
    runGitInTmpDir(['add', '-f', 'node_modules/.bin/tool']);
    runGitInTmpDir(['commit', '-m', 'feat: add local file']);

    runGitInTmpDir(['rm', '-f', 'node_modules/.bin/tool']);
    fs.writeFileSync(path.join(testTmpDir, 'FEATURE.md'), 'clean feature\n');
    runGitInTmpDir(['add', 'FEATURE.md']);
    runGitInTmpDir(['commit', '-m', 'feat: add feature']);
    const headSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'pr-branch:pr-branch']);
    runGitInTmpDir(['checkout', 'main']);

    const gitSpy = redirectRemoteGitCommands(git);
    const errorSpy = spyOn(Log, 'error');
    mockPrGraphql(56, headSha, baseSha);

    const code = await rebasePr(56);

    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(
      jasmine.stringMatching(/forbidden files under node_modules\//),
    );
    expect(runGitInTmpDir(['rev-parse', '--abbrev-ref', 'HEAD'])).toBe('main');
    expect(
      gitSpy.calls.allArgs().some(([args]) => args[0] === 'checkout' && args.includes(headSha)),
    ).toBeFalse();
    expect(
      gitSpy.calls.allArgs().some(([args]) => args[0] === 'rebase' && args[1] !== '--abort'),
    ).toBeFalse();
  });

  it('rebases a clean pull request onto the latest target branch tip and pushes with lease', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    installSandboxGitClient(git);

    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'base\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    runGitInTmpDir(['checkout', '-B', 'pr-branch', baseSha]);
    fs.writeFileSync(path.join(testTmpDir, 'FEATURE.md'), 'clean feature\n');
    runGitInTmpDir(['add', 'FEATURE.md']);
    runGitInTmpDir(['commit', '-m', 'feat: add feature']);
    const headSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'pr-branch:pr-branch']);

    runGitInTmpDir(['checkout', 'main']);
    fs.writeFileSync(path.join(testTmpDir, 'UPSTREAM.md'), 'upstream advance\n');
    runGitInTmpDir(['add', 'UPSTREAM.md']);
    runGitInTmpDir(['commit', '-m', 'docs: advance main']);
    const latestMainSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['push', remoteDir, 'main:main']);

    redirectRemoteGitCommands(git);
    mockPrGraphql(57, headSha, baseSha);

    const code = await rebasePr(57);

    expect(code).toBe(0);
    expect(runGitInTmpDir(['rev-parse', '--abbrev-ref', 'HEAD'])).toBe('main');
    const rebasedRemoteParent = runGitInTmpDir(['--git-dir', remoteDir, 'rev-parse', 'pr-branch^']);
    expect(rebasedRemoteParent).toBe(latestMainSha);
  });
});
