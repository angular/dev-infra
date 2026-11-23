/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {ActiveReleaseTrains} from '../../release/versioning/active-release-trains.js';
import {
  cleanTestTmpDir,
  getMockGitClient,
  installSandboxGitClient,
  mockNgDevConfig,
  runGitInTmpDir,
  testTmpDir,
} from '../../utils/testing/index.js';
import {ForbiddenPullRequestPathsError} from '../common/validation/assert-safe-pr-files.js';
import {checkoutAsPrTakeover} from './takeover.js';
import {checkoutToTargetBranch} from './target.js';

describe('pr checkout handlers', () => {
  beforeEach(() => {
    cleanTestTmpDir();
    runGitInTmpDir(['init']);
    runGitInTmpDir(['config', 'user.email', 'caretaker@angular.io']);
    runGitInTmpDir(['config', 'user.name', 'Caretaker']);
  });

  it('rejects checkoutAsPrTakeover before filter-branch when an intermediate commit touches node_modules/', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    installSandboxGitClient(git);

    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'init\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    runGitInTmpDir(['checkout', '--detach', baseSha]);
    const disallowedDir = path.join(testTmpDir, 'node_modules', '.bin');
    fs.mkdirSync(disallowedDir, {recursive: true});
    fs.writeFileSync(path.join(disallowedDir, 'node'), '#!/bin/sh\n');
    runGitInTmpDir(['add', '-f', 'node_modules/.bin/node']);
    runGitInTmpDir(['commit', '-m', 'feat: add temporary file']);

    runGitInTmpDir(['rm', '-f', 'node_modules/.bin/node']);
    fs.writeFileSync(path.join(testTmpDir, 'GUIDE.md'), 'guide\n');
    runGitInTmpDir(['add', 'GUIDE.md']);
    runGitInTmpDir(['commit', '-m', 'feat: add guide']);
    const headSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    const runSpy = spyOn(git, 'run').and.callThrough();
    const resetGitState = jasmine.createSpy('resetGitState');
    const pullRequest = {
      author: {login: 'angular-robot'},
      baseRefOid: baseSha,
      headRefOid: headSha,
      baseRef: {
        name: 'main',
        repository: {
          url: 'https://github.com/owner/name.git',
          nameWithOwner: 'owner/name',
        },
      },
    };

    await expectAsync(
      checkoutAsPrTakeover(101, {resetGitState, pullRequest} as any),
    ).toBeRejectedWithError(ForbiddenPullRequestPathsError);

    expect(resetGitState).toHaveBeenCalledTimes(1);
    expect(runSpy.calls.allArgs().some(([args]) => args[0] === 'filter-branch')).toBeFalse();
  });

  it('rejects checkoutToTargetBranch before cherry-pick when an intermediate commit touches node_modules/', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    installSandboxGitClient(git);

    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'init\n');
    runGitInTmpDir(['checkout', '-B', 'main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    runGitInTmpDir(['checkout', '-B', 'pr-source']);
    const disallowedDir = path.join(testTmpDir, 'node_modules', '.bin');
    fs.mkdirSync(disallowedDir, {recursive: true});
    fs.writeFileSync(path.join(disallowedDir, 'tool'), '#!/bin/sh\n');
    runGitInTmpDir(['add', '-f', 'node_modules/.bin/tool']);
    runGitInTmpDir(['commit', '-m', 'feat: add temporary file']);

    runGitInTmpDir(['rm', '-f', 'node_modules/.bin/tool']);
    fs.writeFileSync(path.join(testTmpDir, 'DOCS.md'), 'docs\n');
    runGitInTmpDir(['add', 'DOCS.md']);
    runGitInTmpDir(['commit', '-m', 'docs: add docs']);
    const headSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['checkout', 'main']);

    spyOn(ActiveReleaseTrains, 'fetch').and.resolveTo({
      releaseCandidate: null,
      exceptionalMinor: null,
      next: {branchName: 'main'},
      latest: {branchName: '18.2.x'},
    } as unknown as ActiveReleaseTrains);

    const origRun = git.run.bind(git);
    const runSpy = spyOn(git, 'run').and.callFake(((args: string[], opts?: any) => {
      if (args[0] === 'fetch') {
        return {stdout: ''};
      }
      return origRun(args, opts);
    }) as any);

    const resetGitState = jasmine.createSpy('resetGitState');
    const pullRequest = {
      author: {login: 'contributor'},
      baseRefOid: baseSha,
      headRefOid: headSha,
      baseRef: {
        name: 'main',
        repository: {
          url: 'https://github.com/owner/name.git',
          nameWithOwner: 'owner/name',
        },
      },
    };

    await expectAsync(
      checkoutToTargetBranch(102, 'main', {resetGitState, pullRequest} as any),
    ).toBeRejectedWithError(ForbiddenPullRequestPathsError);

    expect(resetGitState).toHaveBeenCalledTimes(1);
    expect(runSpy.calls.allArgs().some(([args]) => args[0] === 'cherry-pick')).toBeFalse();
  });
});
