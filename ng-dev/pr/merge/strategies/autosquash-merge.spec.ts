/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {
  cleanTestTmpDir,
  getMockGitClient,
  mockNgDevConfig,
  runGitInTmpDir,
  testTmpDir,
} from '../../../utils/testing/index.js';
import {ForbiddenPullRequestFilesFatalError} from '../failures.js';
import {PullRequest} from '../pull-request.js';
import {AutosquashMergeStrategy} from './autosquash-merge.js';
import {TEMP_PR_HEAD_BRANCH} from './strategy.js';

describe('AutosquashMergeStrategy#check', () => {
  beforeEach(() => {
    cleanTestTmpDir();
    runGitInTmpDir(['init']);
    runGitInTmpDir(['config', 'user.email', 'caretaker@angular.io']);
    runGitInTmpDir(['config', 'user.name', 'Caretaker']);
  });

  it('allows valid fixup! commits when the target branch has advanced past baseSha', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'initial\n');
    runGitInTmpDir(['checkout', '-B', 'merge_pr_target_main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    fs.writeFileSync(path.join(testTmpDir, 'UPSTREAM.md'), 'upstream\n');
    runGitInTmpDir(['add', 'UPSTREAM.md']);
    runGitInTmpDir(['commit', '-m', 'docs: upstream change']);

    runGitInTmpDir(['checkout', '-B', TEMP_PR_HEAD_BRANCH, baseSha]);
    fs.writeFileSync(path.join(testTmpDir, 'NOTES.md'), 'draft notes\n');
    runGitInTmpDir(['add', 'NOTES.md']);
    runGitInTmpDir(['commit', '-m', 'docs: add notes']);

    fs.writeFileSync(path.join(testTmpDir, 'USAGE.md'), 'usage\n');
    runGitInTmpDir(['add', 'USAGE.md']);
    runGitInTmpDir(['commit', '-m', 'docs: add usage']);

    fs.writeFileSync(path.join(testTmpDir, 'NOTES.md'), 'final notes\n');
    runGitInTmpDir(['add', 'NOTES.md']);
    runGitInTmpDir(['commit', '-m', 'fixup! docs: add notes']);
    const headSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['checkout', 'merge_pr_target_main']);

    const pr = {
      prNumber: 1,
      githubTargetBranch: 'main',
      targetBranches: ['main'],
      baseSha,
      headSha,
      revisionRange: `${baseSha}..${TEMP_PR_HEAD_BRANCH}`,
    } as unknown as PullRequest;

    await expectAsync(new AutosquashMergeStrategy(git).check(pr)).toBeResolved();
  });

  it('rejects fixup! commits touching Node_Modules/ before running git rebase', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'base\n');
    runGitInTmpDir(['checkout', '-B', 'merge_pr_target_main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    runGitInTmpDir(['checkout', '-B', TEMP_PR_HEAD_BRANCH]);
    fs.writeFileSync(path.join(testTmpDir, 'NOTES.md'), 'notes v1\n');
    runGitInTmpDir(['add', 'NOTES.md']);
    runGitInTmpDir(['commit', '-m', 'docs: add notes']);

    const disallowedDir = path.join(testTmpDir, 'Node_Modules', '.bin');
    fs.mkdirSync(disallowedDir, {recursive: true});
    const disallowedFile = path.join(disallowedDir, 'tool');
    fs.writeFileSync(disallowedFile, '#!/bin/sh\nexit 0\n');
    fs.chmodSync(disallowedFile, 0o755);
    fs.writeFileSync(path.join(testTmpDir, 'USAGE.md'), 'usage\n');
    runGitInTmpDir(['add', '-f', 'Node_Modules/.bin/tool', 'USAGE.md']);
    runGitInTmpDir(['commit', '-m', 'docs: add usage']);

    runGitInTmpDir(['rm', '-f', 'Node_Modules/.bin/tool']);
    fs.writeFileSync(path.join(testTmpDir, 'NOTES.md'), 'notes v2\n');
    runGitInTmpDir(['add', 'NOTES.md']);
    runGitInTmpDir(['commit', '-m', 'fixup! docs: add notes']);
    const headSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['checkout', 'merge_pr_target_main']);

    const runSpy = spyOn(git, 'run').and.callThrough();
    const pr = {
      prNumber: 4,
      githubTargetBranch: 'main',
      targetBranches: ['main'],
      baseSha,
      headSha,
      revisionRange: `${baseSha}..${TEMP_PR_HEAD_BRANCH}`,
    } as unknown as PullRequest;

    await expectAsync(new AutosquashMergeStrategy(git).check(pr)).toBeRejectedWithError(
      ForbiddenPullRequestFilesFatalError,
    );
    expect(runSpy.calls.allArgs().some(([gitArgs]) => gitArgs[0] === 'rebase')).toBeFalse();
    expect(fs.existsSync(disallowedFile)).toBeFalse();
  });
});
