/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import {join} from 'path';

import {ReleaseTrain} from '../../../versioning/release-trains.js';
import {CutExceptionalMinorPrereleaseAction} from '../../actions/exceptional-minor/cut-exceptional-minor-prerelease.js';
import {changelogPattern, parse, setupReleaseActionForTesting} from '../test-utils/test-utils.js';
import {
  expectGithubApiRequestsForStaging,
  expectStagingAndPublishWithCherryPick,
} from '../test-utils/staging-test.js';
import {testTmpDir, SandboxGitRepo} from '../../../../utils/testing/index.js';
import {ActiveReleaseTrains} from '../../../versioning/index.js';
import {workspaceRelativePackageJsonPath} from '../../../../utils/constants.js';

describe('cut exceptional minor pre-release action', () => {
  it('should only be active if there is an exceptional minor', async () => {
    expect(
      await CutExceptionalMinorPrereleaseAction.isActive(
        new ActiveReleaseTrains({
          exceptionalMinor: null,
          releaseCandidate: null,
          latest: new ReleaseTrain('14.4.x', parse('14.4.0')),
          next: new ReleaseTrain('main', parse('14.5.0-next.0')),
        }),
      ),
    ).toBe(false);

    expect(
      await CutExceptionalMinorPrereleaseAction.isActive(
        new ActiveReleaseTrains({
          exceptionalMinor: new ReleaseTrain('14.5.x', parse('14.5.0-next.0')),
          releaseCandidate: null,
          latest: new ReleaseTrain('14.4.x', parse('14.4.0')),
          next: new ReleaseTrain('main', parse('15.0.0-next.0')),
        }),
      ),
    ).toBe(true);
  });

  // This is test for a special case in the release tooling. Whenever we branch off
  // for the exceptional minor, we immediately bump the version in the `next` branch
  // but do not publish it.
  describe('current next version has not been published', () => {
    it('should not bump the version', async () => {
      const action = setupReleaseActionForTesting(
        CutExceptionalMinorPrereleaseAction,
        new ActiveReleaseTrains({
          exceptionalMinor: new ReleaseTrain('10.2.x', parse('10.2.0-next.0')),
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('11.0.0-next.0')),
          latest: new ReleaseTrain('10.1.x', parse('10.1.0')),
        }),
        {isExceptionalMinorPublishedToNpm: false},
      );

      await expectStagingAndPublishWithCherryPick(
        action,
        '10.2.x',
        '10.2.0-next.0',
        'exceptional-minor',
      );

      const pkgJsonContents = readFileSync(
        join(action.projectDir, workspaceRelativePackageJsonPath),
        'utf8',
      );
      const pkgJson = JSON.parse(pkgJsonContents) as {version: string; [key: string]: any};
      expect(pkgJson.version).toBe('10.2.0-next.0', 'Expected version to not have changed.');
    });

    it('should generate release notes capturing changes to the latest patch', async () => {
      const action = setupReleaseActionForTesting(
        CutExceptionalMinorPrereleaseAction,
        new ActiveReleaseTrains({
          exceptionalMinor: new ReleaseTrain('10.2.x', parse('10.2.0-next.0')),
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('11.0.0-next.0')),
          latest: new ReleaseTrain('10.1.x', parse('10.1.0')),
        }),
        {useSandboxGitClient: true, isExceptionalMinorPublishedToNpm: false},
      );

      SandboxGitRepo.withInitialCommit(action.githubConfig)
        .branchOff('10.1.x')
        .commit('feat(pkg1): patch already released *1')
        .commit('feat(pkg1): patch already released *2')
        .createTagForHead('10.1.0')
        .commit('feat(pkg1): not released yet *1')
        .branchOff('10.2.x')
        .commit('build: prepare for exceptional minor commit')
        .commit('feat(pkg1): not released yet *2');

      await expectGithubApiRequestsForStaging(action, '10.2.x', '10.2.0-next.0', true);
      await action.instance.perform();

      const changelog = readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

      expect(changelog).toMatch(changelogPattern`
          # 10.2.0-next.0 <..>
          ### pkg1
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | feat | not released yet *1 |
          | <..> | feat | not released yet *2 |
          ## Special Thanks
        `);
    });
  });

  describe('no `-rc` exceptional minor yet', () => {
    it('should create a proper new version and select correct branch', async () => {
      const action = setupReleaseActionForTesting(
        CutExceptionalMinorPrereleaseAction,
        new ActiveReleaseTrains({
          exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-next.0')),
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('11.0.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
        }),
      );

      await expectStagingAndPublishWithCherryPick(
        action,
        '10.1.x',
        '10.1.0-next.1',
        'exceptional-minor',
      );
    });

    it('should generate release notes capturing changes to the previous pre-release', async () => {
      const action = setupReleaseActionForTesting(
        CutExceptionalMinorPrereleaseAction,
        new ActiveReleaseTrains({
          exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-next.0')),
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('11.0.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
        }),
        {useSandboxGitClient: true},
      );

      SandboxGitRepo.withInitialCommit(action.githubConfig)
        .branchOff('10.1.x')
        .commit('feat(pkg1): exceptional minor already released *1')
        .commit('feat(pkg1): exceptional minor already released *2')
        .createTagForHead('10.1.0-next.0')
        .commit('feat(pkg1): not released yet *1')
        .commit('feat(pkg1): not released yet *2');

      await expectGithubApiRequestsForStaging(action, '10.1.x', '10.1.0-next.1', true);
      await action.instance.perform();

      const changelog = readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

      expect(changelog).toMatch(changelogPattern`
        # 10.1.0-next.1 <..>
        ### pkg1
        | Commit | Type | Description |
        | -- | -- | -- |
        | <..> | feat | not released yet *1 |
        | <..> | feat | not released yet *2 |
        ## Special Thanks
      `);
    });
  });

  describe('already in the `release-candidate` phase', () => {
    it('should create a proper new version and select correct branch', async () => {
      const action = setupReleaseActionForTesting(
        CutExceptionalMinorPrereleaseAction,
        new ActiveReleaseTrains({
          exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('11.0.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
        }),
      );

      await expectStagingAndPublishWithCherryPick(
        action,
        '10.1.x',
        '10.1.0-rc.1',
        'exceptional-minor',
      );
    });

    it('should generate release notes capturing changes to the previous pre-release', async () => {
      const action = setupReleaseActionForTesting(
        CutExceptionalMinorPrereleaseAction,
        new ActiveReleaseTrains({
          exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('11.0.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
        }),
        {useSandboxGitClient: true},
      );

      SandboxGitRepo.withInitialCommit(action.githubConfig)
        .branchOff('10.1.x')
        .commit('feat(pkg1): exceptional-minor already released *1')
        .commit('feat(pkg1): exceptional-minor already released *2')
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
