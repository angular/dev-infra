/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import nock from 'nock';
import path from 'path';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {
  cleanTestTmpDir,
  getMockGitClient,
  installSandboxGitClient,
  mockNgDevConfig,
  runGitInTmpDir,
  testTmpDir,
} from '../../../utils/testing/index.js';
import {checkOutPullRequestLocally} from '../checkout-pr.js';
import {
  assertNoNodeModulesInCommitRange,
  assertNoNodeModulesInTree,
  ensureBaseCommitExistsLocally,
  extractNodeModulesPaths,
  ForbiddenPullRequestPathsError,
  MismatchedFetchedHeadShaError,
} from '../validation/assert-safe-pr-files.js';

describe('pull request file and head SHA guards', () => {
  beforeEach(() => {
    cleanTestTmpDir();
    runGitInTmpDir(['init']);
    runGitInTmpDir(['config', 'user.email', 'caretaker@angular.io']);
    runGitInTmpDir(['config', 'user.name', 'Caretaker']);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('extracts node_modules paths across case, NTFS trailing dots/spaces, 8.3 names, and Unicode forms', () => {
    const raw = [
      '',
      'README.md',
      'node_modules/.bin/tool',
      '',
      'packages/core/node_modules/.bin/helper',
      'Node_Modules/@angular/ng-dev/bundles/chunk.mjs',
      'NODE_MODULES/pkg/index.js',
      'node_modules./script.js',
      'node_modules /script.js',
      'NODE_M~1/script.js',
      'NODEMO~2/script.js',
      'node_\u200cmodules/script.js',
      'packages/node_modules_helper/index.ts',
      'docs/my_node_modules/guide.md',
      'node_modules/caf\u0065\u0301/index.js',
      'node_modules/.bin/tool',
      '',
    ].join('\0');

    expect(extractNodeModulesPaths(raw)).toEqual([
      'node_modules/.bin/tool',
      'packages/core/node_modules/.bin/helper',
      'Node_Modules/@angular/ng-dev/bundles/chunk.mjs',
      'NODE_MODULES/pkg/index.js',
      'node_modules./script.js',
      'node_modules /script.js',
      'NODE_M~1/script.js',
      'NODEMO~2/script.js',
      'node_\u200cmodules/script.js',
      'node_modules/caf\u0065\u0301/index.js',
    ]);
  });

  it('rejects non-ASCII paths under top-level node_modules/ even with core.quotePath enabled', () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    runGitInTmpDir(['config', 'core.quotePath', 'true']);
    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'init\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    const nonAsciiDir = path.join(testTmpDir, 'node_modules', 'café');
    fs.mkdirSync(nonAsciiDir, {recursive: true});
    fs.writeFileSync(path.join(nonAsciiDir, 'helper.js'), 'export {};\n');
    runGitInTmpDir(['add', '-f', 'node_modules/café/helper.js']);
    runGitInTmpDir(['commit', '-m', 'feat: add non-ascii path']);
    const intermediateSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    expect(() => assertNoNodeModulesInTree(git, intermediateSha)).toThrowError(
      ForbiddenPullRequestPathsError,
    );

    runGitInTmpDir(['rm', '-f', 'node_modules/café/helper.js']);
    runGitInTmpDir(['commit', '-m', 'feat: remove non-ascii path']);
    const cleanHeadSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    expect(() => assertNoNodeModulesInTree(git, cleanHeadSha)).not.toThrow();
    expect(() => assertNoNodeModulesInCommitRange(git, `${baseSha}..${cleanHeadSha}`)).toThrowError(
      ForbiddenPullRequestPathsError,
    );
  });

  it('rejects signed commits touching node_modules/ even when log.showSignature is enabled', () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    runGitInTmpDir(['config', 'log.showSignature', 'true']);
    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'init\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    const disallowedDir = path.join(testTmpDir, 'node_modules', '.bin');
    fs.mkdirSync(disallowedDir, {recursive: true});
    fs.writeFileSync(path.join(disallowedDir, 'helper'), '#!/bin/sh\n');
    runGitInTmpDir(['add', '-f', 'node_modules/.bin/helper']);
    const treeSha = runGitInTmpDir(['write-tree']);

    // Construct a commit object carrying an SSH gpgsig header so `log.showSignature=true` would
    // emit signature verification lines unless `--no-show-signature` is passed.
    const rawCommit = [
      `tree ${treeSha}`,
      `parent ${baseSha}`,
      `author Caretaker <caretaker@angular.io> 1700000000 +0000`,
      `committer Caretaker <caretaker@angular.io> 1700000000 +0000`,
      `gpgsig -----BEGIN SSH SIGNATURE-----`,
      ` U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAA==`,
      ` -----END SSH SIGNATURE-----`,
      ``,
      `feat: signed change`,
      ``,
    ].join('\n');
    const rawCommitFile = path.join(testTmpDir, '.git', 'raw-signed-commit');
    fs.writeFileSync(rawCommitFile, rawCommit);
    const signedSha = runGitInTmpDir(['hash-object', '-t', 'commit', '-w', rawCommitFile]);
    runGitInTmpDir(['checkout', '-f', signedSha]);

    runGitInTmpDir(['rm', '-f', 'node_modules/.bin/helper']);
    runGitInTmpDir(['commit', '-m', 'feat: clean up']);
    const headSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    expect(() => assertNoNodeModulesInCommitRange(git, `${baseSha}..${headSha}`)).toThrowError(
      ForbiddenPullRequestPathsError,
    );
  });

  it('allows pure deletions of pre-existing node_modules/ files while rejecting additions or modifications', () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    const legacyDir = path.join(testTmpDir, 'fixtures', 'node_modules', 'pkg');
    fs.mkdirSync(legacyDir, {recursive: true});
    fs.writeFileSync(path.join(legacyDir, 'index.js'), 'v1\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', '-f', 'fixtures/node_modules/pkg/index.js']);
    runGitInTmpDir(['commit', '-m', 'build: initial fixture']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    // Pure deletion of an inherited path is permitted.
    runGitInTmpDir(['checkout', '-B', 'delete-fixture', baseSha]);
    runGitInTmpDir(['rm', '-f', 'fixtures/node_modules/pkg/index.js']);
    runGitInTmpDir(['commit', '-m', 'chore: remove legacy fixture']);
    const deleteHeadSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    expect(() =>
      assertNoNodeModulesInCommitRange(git, `${baseSha}..${deleteHeadSha}`),
    ).not.toThrow();

    // Modifying an inherited path under `node_modules/` is still rejected.
    runGitInTmpDir(['checkout', '-B', 'modify-fixture', baseSha]);
    fs.writeFileSync(path.join(legacyDir, 'index.js'), 'v2\n');
    runGitInTmpDir(['add', '-f', 'fixtures/node_modules/pkg/index.js']);
    runGitInTmpDir(['commit', '-m', 'chore: modify legacy fixture']);
    const modifyHeadSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    expect(() =>
      assertNoNodeModulesInCommitRange(git, `${baseSha}..${modifyHeadSha}`),
    ).toThrowError(ForbiddenPullRequestPathsError);
  });

  it('skips fetching when baseRefOid exists locally and falls back when deepen is insufficient', () => {
    const existingGit = jasmine.createSpyObj<AuthenticatedGitClient>('git', ['run', 'runGraceful']);
    existingGit.runGraceful.and.returnValue({status: 0} as any);

    ensureBaseCommitExistsLocally(
      existingGit,
      'abc1234',
      'https://x-access-token:tok@github.com/angular/angular.git',
      'main',
    );
    expect(existingGit.run).not.toHaveBeenCalled();

    const missingGit = jasmine.createSpyObj<AuthenticatedGitClient>('git', ['run', 'runGraceful']);
    missingGit.runGraceful.and.returnValues(
      {status: 1} as any,
      {status: 1} as any,
      {status: 0} as any,
    );

    ensureBaseCommitExistsLocally(
      missingGit,
      'deadbeef',
      'https://x-access-token:tok@github.com/angular/angular.git',
      'main',
    );

    expect(missingGit.run).toHaveBeenCalledWith([
      'fetch',
      '-q',
      'https://x-access-token:tok@github.com/angular/angular.git',
      '--deepen=500',
      '--',
      'main',
    ]);
    expect(missingGit.runGraceful).toHaveBeenCalledWith(
      [
        'fetch',
        '-q',
        'https://x-access-token:tok@github.com/angular/angular.git',
        '--depth=1',
        '--',
        'deadbeef',
      ],
      {stdio: 'ignore'},
    );
  });

  it('rejects checkOutPullRequestLocally when FETCH_HEAD differs from pr.headRefOid', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    installSandboxGitClient(git);

    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'init\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    spyOn(git, 'run').and.callFake(((args: string[]) => {
      if (args[0] === 'rev-parse' && args[1] === 'FETCH_HEAD') {
        return {stdout: 'moved-fork-sha\n'};
      }
      return {stdout: 'main\n'};
    }) as any);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequest: {
              author: {login: 'contributor'},
              state: 'OPEN',
              maintainerCanModify: true,
              viewerDidAuthor: false,
              headRefOid: 'validated-pr-sha',
              headRef: {
                name: 'pr-branch',
                repository: {
                  url: 'https://github.com/contributor/name.git',
                  nameWithOwner: 'contributor/name',
                },
              },
              baseRefOid: baseSha,
              baseRef: {
                name: 'master',
                repository: {
                  url: 'https://github.com/owner/name.git',
                  nameWithOwner: 'owner/name',
                },
              },
            },
          },
        },
      });

    await expectAsync(checkOutPullRequestLocally(99)).toBeRejectedWithError(
      MismatchedFetchedHeadShaError,
    );
  });

  it('rejects checkOutPullRequestLocally before checkout when PR commits touch mixed-case Node_Modules/', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    installSandboxGitClient(git);

    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'init\n');
    runGitInTmpDir(['checkout', '-B', 'master']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    runGitInTmpDir(['checkout', '-B', 'fork-pr']);
    const disallowedDir = path.join(testTmpDir, 'Node_Modules', '.bin');
    fs.mkdirSync(disallowedDir, {recursive: true});
    const disallowedFile = path.join(disallowedDir, 'node');
    fs.writeFileSync(disallowedFile, '#!/bin/sh\n');
    runGitInTmpDir(['add', '-f', 'Node_Modules/.bin/node']);
    runGitInTmpDir(['commit', '-m', 'feat: add file']);
    const unexpectedHeadSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['checkout', 'master']);

    const origRun = git.run.bind(git);
    spyOn(git, 'run').and.callFake(((args: string[], opts?: any) => {
      if (args[0] === 'rev-parse' && args[1] === 'FETCH_HEAD') {
        return {stdout: `${unexpectedHeadSha}\n`};
      }
      return origRun(args, opts);
    }) as any);

    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: {
            pullRequest: {
              author: {login: 'contributor'},
              state: 'OPEN',
              maintainerCanModify: true,
              viewerDidAuthor: false,
              headRefOid: unexpectedHeadSha,
              headRef: {
                name: 'fork-pr',
                repository: {
                  url: 'https://github.com/contributor/name.git',
                  nameWithOwner: 'contributor/name',
                },
              },
              baseRefOid: baseSha,
              baseRef: {
                name: 'master',
                repository: {
                  url: 'https://github.com/owner/name.git',
                  nameWithOwner: 'owner/name',
                },
              },
            },
          },
        },
      });

    await expectAsync(checkOutPullRequestLocally(100)).toBeRejectedWithError(
      ForbiddenPullRequestPathsError,
    );
    expect(fs.existsSync(disallowedFile)).toBeFalse();
  });
});
