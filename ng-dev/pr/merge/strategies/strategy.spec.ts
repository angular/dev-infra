/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {spawnSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {
  cleanTestTmpDir,
  getMockGitClient,
  mockNgDevConfig,
  runGitInTmpDir,
  testTmpDir,
} from '../../../utils/testing/index.js';
import {
  ForbiddenPullRequestFilesFatalError,
  MismatchedPullRequestHeadShaFatalError,
  MismatchedTargetBranchFatalError,
} from '../failures.js';
import {PullRequest} from '../pull-request.js';
import {MergeStrategy, TEMP_PR_HEAD_BRANCH} from './strategy.js';

/** Minimal concrete strategy so the abstract base's `prepare` can be exercised. */
class TestMergeStrategy extends MergeStrategy {
  override async merge(): Promise<void> {}
}

class TestShallowGitClient extends AuthenticatedGitClient {
  constructor(baseDir: string) {
    super('abc123', 'user', mockNgDevConfig, baseDir);
  }
}

/** Builds a `PullRequest` with only the fields `prepare` relies on. */
function createPullRequest(headSha: string): PullRequest {
  return {
    prNumber: 123,
    headSha,
    targetBranches: ['main'],
  } as unknown as PullRequest;
}

describe('MergeStrategy#prepare', () => {
  let gitClient: jasmine.SpyObj<AuthenticatedGitClient>;

  beforeEach(() => {
    gitClient = jasmine.createSpyObj<AuthenticatedGitClient>('git', ['run', 'getRepoGitUrl']);
    gitClient.getRepoGitUrl.and.returnValue('https://github.com/angular/angular.git');
  });

  /** Makes `git rev-parse merge_pr_head` resolve to `fetchedHeadSha`. */
  function stubFetchedHead(fetchedHeadSha: string): void {
    gitClient.run.and.callFake((args: string[]) => {
      if (args[0] === 'rev-parse' && args[1] === TEMP_PR_HEAD_BRANCH) {
        return {stdout: `${fetchedHeadSha}\n`} as ReturnType<AuthenticatedGitClient['run']>;
      }
      return {stdout: ''} as ReturnType<AuthenticatedGitClient['run']>;
    });
  }

  it('rejects when the fetched PR head no longer matches the validated head SHA', async () => {
    stubFetchedHead('pushed-after-validation-sha');

    await expectAsync(
      new TestMergeStrategy(gitClient).prepare(createPullRequest('validated-sha')),
    ).toBeRejectedWithError(MismatchedPullRequestHeadShaFatalError);
  });

  it('resolves when the fetched PR head matches the validated head SHA', async () => {
    stubFetchedHead('validated-sha');

    await expectAsync(
      new TestMergeStrategy(gitClient).prepare(createPullRequest('validated-sha')),
    ).toBeResolved();
  });
});

describe('MergeStrategy#check', () => {
  beforeEach(() => {
    cleanTestTmpDir();
    runGitInTmpDir(['init']);
    runGitInTmpDir(['config', 'user.email', 'caretaker@angular.io']);
    runGitInTmpDir(['config', 'user.name', 'Caretaker']);
  });

  it('throws MismatchedTargetBranchFatalError when githubTargetBranch is not in targetBranches', async () => {
    const spyGit = jasmine.createSpyObj<AuthenticatedGitClient>('git', ['run']);
    const pr = {
      prNumber: 42,
      githubTargetBranch: 'main',
      targetBranches: ['22.2.x'],
      baseSha: 'abc123',
      headSha: 'def456',
      revisionRange: 'abc123..merge_pr_head',
    } as unknown as PullRequest;

    await expectAsync(new TestMergeStrategy(spyGit).check(pr)).toBeRejectedWithError(
      MismatchedTargetBranchFatalError,
    );
    expect(spyGit.run).not.toHaveBeenCalled();
  });

  it('resolves slash-containing and advanced target branches cleanly during check()', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'init\n');
    runGitInTmpDir(['checkout', '-B', 'merge_pr_target_feature_test']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'feat: base']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    // Advance the target branch past `baseSha` to match normal caretaker merges.
    fs.writeFileSync(path.join(testTmpDir, 'UPSTREAM.md'), 'upstream\n');
    runGitInTmpDir(['add', 'UPSTREAM.md']);
    runGitInTmpDir(['commit', '-m', 'docs: upstream update']);

    runGitInTmpDir(['checkout', '-B', TEMP_PR_HEAD_BRANCH, baseSha]);
    fs.writeFileSync(path.join(testTmpDir, 'NOTES.md'), 'notes\n');
    runGitInTmpDir(['add', 'NOTES.md']);
    runGitInTmpDir(['commit', '-m', 'docs: add notes']);
    const headSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['checkout', 'merge_pr_target_feature_test']);

    const pr = {
      prNumber: 43,
      githubTargetBranch: 'feature/test',
      targetBranches: ['feature/test'],
      baseSha,
      headSha,
      revisionRange: `${baseSha}..${TEMP_PR_HEAD_BRANCH}`,
    } as unknown as PullRequest;

    await expectAsync(new TestMergeStrategy(git).check(pr)).toBeResolved();
  });

  it('succeeds in a --depth=1 shallow clone where merge-base with the target tip is unreachable', async () => {
    const gitBin = process.env['GIT_BIN']!;
    const originDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-dev-shallow-origin-'));
    const shallowDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-dev-shallow-clone-'));
    try {
      runGitInTmpDir(['init', '--bare', originDir]);
      fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'c1\n');
      runGitInTmpDir(['checkout', '-B', 'main']);
      runGitInTmpDir(['add', 'README.md']);
      runGitInTmpDir(['commit', '-m', 'build: c1']);
      const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

      for (let i = 2; i <= 4; i++) {
        fs.writeFileSync(path.join(testTmpDir, `FILE_${i}.md`), `c${i}\n`);
        runGitInTmpDir(['add', `FILE_${i}.md`]);
        runGitInTmpDir(['commit', '-m', `docs: c${i}`]);
      }
      runGitInTmpDir(['push', originDir, 'main:refs/heads/main']);

      runGitInTmpDir(['checkout', '-B', 'pr-branch', baseSha]);
      fs.writeFileSync(path.join(testTmpDir, 'PR.md'), 'pr change\n');
      runGitInTmpDir(['add', 'PR.md']);
      runGitInTmpDir(['commit', '-m', 'feat: add pr file']);
      const headSha = runGitInTmpDir(['rev-parse', 'HEAD']);
      runGitInTmpDir(['push', originDir, `${headSha}:refs/pull/44/head`]);

      spawnSync(gitBin, ['clone', '--depth=1', `file://${originDir}`, shallowDir], {
        encoding: 'utf8',
      });
      spawnSync(gitBin, ['config', 'user.email', 'caretaker@angular.io'], {cwd: shallowDir});
      spawnSync(gitBin, ['config', 'user.name', 'Caretaker'], {cwd: shallowDir});
      spawnSync(
        gitBin,
        [
          'fetch',
          '-q',
          '-f',
          `file://${originDir}`,
          'refs/heads/main:merge_pr_target_main',
          `refs/pull/44/head:${TEMP_PR_HEAD_BRANCH}`,
        ],
        {cwd: shallowDir, encoding: 'utf8'},
      );

      const shallowGit = new TestShallowGitClient(shallowDir);
      const pr = {
        prNumber: 44,
        githubTargetBranch: 'main',
        targetBranches: ['main'],
        baseSha,
        headSha,
        revisionRange: `${baseSha}..${TEMP_PR_HEAD_BRANCH}`,
      } as unknown as PullRequest;

      await expectAsync(new TestMergeStrategy(shallowGit).check(pr)).toBeResolved();
    } finally {
      fs.rmSync(originDir, {recursive: true, force: true});
      fs.rmSync(shallowDir, {recursive: true, force: true});
    }
  });

  it('rejects when an intermediate commit adds and later deletes a file under node_modules/', async () => {
    const git = getMockGitClient(mockNgDevConfig.github, true);
    fs.writeFileSync(path.join(testTmpDir, 'README.md'), 'init\n');
    runGitInTmpDir(['checkout', '-B', 'merge_pr_target_main']);
    runGitInTmpDir(['add', 'README.md']);
    runGitInTmpDir(['commit', '-m', 'build: initial']);
    const baseSha = runGitInTmpDir(['rev-parse', 'HEAD']);

    runGitInTmpDir(['checkout', '-B', TEMP_PR_HEAD_BRANCH]);
    const disallowedDir = path.join(testTmpDir, 'node_modules', '.bin');
    fs.mkdirSync(disallowedDir, {recursive: true});
    const disallowedFile = path.join(disallowedDir, 'local-tool');
    fs.writeFileSync(disallowedFile, '#!/bin/sh\nexit 0\n');
    fs.chmodSync(disallowedFile, 0o755);
    fs.writeFileSync(path.join(testTmpDir, 'GUIDE.md'), 'guide\n');
    runGitInTmpDir(['add', '-f', 'node_modules/.bin/local-tool', 'GUIDE.md']);
    runGitInTmpDir(['commit', '-m', 'docs: add guide']);

    runGitInTmpDir(['rm', '-f', 'node_modules/.bin/local-tool']);
    fs.writeFileSync(path.join(testTmpDir, 'FAQ.md'), 'faq\n');
    runGitInTmpDir(['add', 'FAQ.md']);
    runGitInTmpDir(['commit', '-m', 'docs: add faq']);
    const headSha = runGitInTmpDir(['rev-parse', 'HEAD']);
    runGitInTmpDir(['checkout', 'merge_pr_target_main']);

    const pr = {
      prNumber: 45,
      githubTargetBranch: 'main',
      targetBranches: ['main'],
      baseSha,
      headSha,
      revisionRange: `${baseSha}..${TEMP_PR_HEAD_BRANCH}`,
    } as unknown as PullRequest;

    await expectAsync(new TestMergeStrategy(git).check(pr)).toBeRejectedWithError(
      ForbiddenPullRequestFilesFatalError,
    );
    expect(fs.existsSync(disallowedFile)).toBeFalse();
  });
});
