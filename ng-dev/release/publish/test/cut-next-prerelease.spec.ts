/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import {join} from 'path';

import {ReleaseTrain} from '../../versioning/release-trains.js';
import {CutNextPrereleaseAction} from '../actions/cut-next-prerelease.js';
import {changelogPattern, parse, setupReleaseActionForTesting} from './test-utils/test-utils.js';
import {
  expectGithubApiRequestsForStaging,
  expectStagingAndPublishWithCherryPick,
  expectStagingAndPublishWithoutCherryPick,
} from './test-utils/staging-test.js';
import {testTmpDir, SandboxGitRepo} from '../../../utils/testing/index.js';
import {ActiveReleaseTrains} from '../../versioning/index.js';
import {workspaceRelativePackageJsonPath} from '../../../utils/constants.js';

describe('cut next pre-release action', () => {
  it('should always be active regardless of release-trains', async () => {
    expect(await CutNextPrereleaseAction.isActive()).toBe(true);
  });

  it('should cut a pre-release for the next branch if there is no FF/RC branch', async () => {
    const action = setupReleaseActionForTesting(
      CutNextPrereleaseAction,
      new ActiveReleaseTrains({
        releaseCandidate: null,
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.1.x', parse('10.1.2')),
      }),
    );

    await expectStagingAndPublishWithoutCherryPick(action, 'master', '10.2.0-next.1', 'next');
  });

  // This is test for a special case in the release tooling. Whenever we branch off for
  // feature-freeze, we immediately bump the version in the `next` branch but do not publish
  // it. This is because there are no new changes in the next branch that wouldn't be part of
  // the branched-off feature-freeze release-train. Also while a FF/RC is active, we cannot
  // publish versions to the NPM dist tag. This means that the version is later published, but
  // still needs all the staging work (e.g. changelog). We special-case this by not incrementing
  // the version if the version in the next branch has not been published yet.
  describe('current next version has not been published', () => {
    it('should not bump the version', async () => {
      const action = setupReleaseActionForTesting(
        CutNextPrereleaseAction,
        new ActiveReleaseTrains({
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.1.x', parse('10.1.0')),
        }),
        /* isNextPublishedToNpm */ false,
      );

      await expectStagingAndPublishWithoutCherryPick(action, 'master', '10.2.0-next.0', 'next');

      const pkgJsonContents = readFileSync(
        join(action.projectDir, workspaceRelativePackageJsonPath),
        'utf8',
      );
      const pkgJson = JSON.parse(pkgJsonContents) as {version: string; [key: string]: any};
      expect(pkgJson.version).toBe('10.2.0-next.0', 'Expected version to not have changed.');
    });

    it(
      'should generate release notes capturing changes to the latest patch while deduping ' +
        'changes that have also landed in the current patch',
      async () => {
        const action = setupReleaseActionForTesting(
          CutNextPrereleaseAction,
          new ActiveReleaseTrains({
            releaseCandidate: null,
            next: new ReleaseTrain('master', parse('10.2.0-next.0')),
            latest: new ReleaseTrain('10.1.x', parse('10.1.0')),
          }),
          /* isNextPublishedToNpm */ false,
          {useSandboxGitClient: true},
        );

        SandboxGitRepo.withInitialCommit(action.githubConfig)
          .branchOff('10.1.x')
          .commit('feat(pkg1): patch already released *1')
          .commit('feat(pkg1): patch already released *2')
          .commit('feat(pkg1): released in patch, but cherry-picked', 1)
          .createTagForHead('10.1.0')
          .commit('feat(pkg1): not released yet, but cherry-picked', 2)
          .switchToBranch('master')
          .commit('feat(pkg1): only in next, not released yet *1')
          .commit('feat(pkg1): only in next, not released yet *2')
          .cherryPick(1)
          .cherryPick(2);

        await expectGithubApiRequestsForStaging(action, 'master', '10.2.0-next.0', false);
        await action.instance.perform();

        const changelog = readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

        expect(changelog).toMatch(changelogPattern`
          # 10.2.0-next.0 <..>
          ### pkg1
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | feat | not released yet, but cherry-picked |
          | <..> | feat | only in next, not released yet *1 |
          | <..> | feat | only in next, not released yet *2 |
          ## Special Thanks
        `);
      },
    );
  });

  describe('with active feature-freeze', () => {
    it('should create a proper new version and select correct branch', async () => {
      const action = setupReleaseActionForTesting(
        CutNextPrereleaseAction,
        new ActiveReleaseTrains({
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.4')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
        }),
      );

      await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0-next.5', 'next');
    });

    it('should generate release notes capturing changes to the previous pre-release', async () => {
      const action = setupReleaseActionForTesting(
        CutNextPrereleaseAction,
        new ActiveReleaseTrains({
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.4')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
        }),
        true,
        {useSandboxGitClient: true},
      );

      SandboxGitRepo.withInitialCommit(action.githubConfig)
        .branchOff('10.1.x')
        .commit('feat(pkg1): feature-freeze already released *1')
        .commit('feat(pkg1): feature-freeze already released *2')
        .createTagForHead('10.1.0-next.4')
        .commit('feat(pkg1): not released yet *1')
        .commit('feat(pkg1): not released yet *2');

      await expectGithubApiRequestsForStaging(action, '10.1.x', '10.1.0-next.5', true);
      await action.instance.perform();

      const changelog = readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

      expect(changelog).toMatch(changelogPattern`
        # 10.1.0-next.5 <..>
        ### pkg1
        | Commit | Type | Description |
        | -- | -- | -- |
        | <..> | feat | not released yet *1 |
        | <..> | feat | not released yet *2 |
        ## Special Thanks
      `);
    });
  });

  describe('with active release-candidate', () => {
    it('should create a proper new version and select correct branch', async () => {
      const action = setupReleaseActionForTesting(
        CutNextPrereleaseAction,
        new ActiveReleaseTrains({
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
        }),
      );

      await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0-rc.1', 'next');
    });

    it('should generate release notes capturing changes to the previous pre-release', async () => {
      const action = setupReleaseActionForTesting(
        CutNextPrereleaseAction,
        new ActiveReleaseTrains({
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
        }),
        true,
        {useSandboxGitClient: true},
      );

      SandboxGitRepo.withInitialCommit(action.githubConfig)
        .branchOff('10.1.x')
        .commit('feat(pkg1): release-candidate already released *1')
        .commit('feat(pkg1): release-candidate already released *2')
        .createTagForHead('10.1.0-rc.0')
        .commit('feat(pkg1): not released yet *1')
        .commit('feat(pkg1): not released yet *2');

      await expectGithubApiRequestsForStaging(action, '10.1.x', '10.1.0-rc.1', true);
      await action.instance.perform();

      const changelog = readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

      expect(changelog).toMatch(changelogPattern`
        # 10.1.0-rc.1 <..>
        ### pkg1
        | Commit | Type | Description |
        | -- | -- | -- |
        | <..> | feat | not released yet *1 |
        | <..> | feat | not released yet *2 |
        ## Special Thanks
      `);
    });
  });
});
