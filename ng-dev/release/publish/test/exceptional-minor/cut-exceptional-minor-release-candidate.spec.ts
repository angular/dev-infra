/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReleaseTrain} from '../../../versioning/release-trains.js';
import {CutExceptionalMinorReleaseCandidateAction} from '../../actions/exceptional-minor/cut-exceptional-minor-release-candidate.js';
import {changelogPattern, parse, setupReleaseActionForTesting} from '../test-utils/test-utils.js';
import {
  expectGithubApiRequests,
  expectStagingAndPublishWithCherryPick,
} from '../test-utils/staging-test.js';
import {readFileSync} from 'fs';
import {testTmpDir, SandboxGitRepo} from '../../../../utils/testing/index.js';
import {ActiveReleaseTrains} from '../../../versioning/index.js';

describe('cut exceptional minor next release candidate action', () => {
  it('should activate if there is an exceptional minor ', async () => {
    expect(
      await CutExceptionalMinorReleaseCandidateAction.isActive(
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
          exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
          releaseCandidate: new ReleaseTrain('11.0.x', parse('11.0.0-next.0')),
          next: new ReleaseTrain('master', parse('11.1.0-next.0')),
        }),
      ),
    ).toBe(true);
  });

  it('should not activate if an RC for exceptional minor has already been cut', async () => {
    // RC is already cut- so this action will not turn active. More RC
    // pre-releases would be cut by the `CutExceptionalMinorPrerelease` action.
    expect(
      await CutExceptionalMinorReleaseCandidateAction.isActive(
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
          exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-rc.1')),
          releaseCandidate: new ReleaseTrain('11.0.x', parse('11.0.0-next.0')),
          next: new ReleaseTrain('master', parse('11.1.0-next.0')),
        }),
      ),
    ).toBe(false);
  });

  it('should not activate if there is no exceptional minor', async () => {
    expect(
      await CutExceptionalMinorReleaseCandidateAction.isActive(
        new ActiveReleaseTrains({
          exceptionalMinor: null,
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.1.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(false);
  });

  it('should create a proper new version and select correct branch', async () => {
    const action = setupReleaseActionForTesting(
      CutExceptionalMinorReleaseCandidateAction,
      new ActiveReleaseTrains({
        latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
        releaseCandidate: new ReleaseTrain('11.0.x', parse('11.0.0-next.0')),
        next: new ReleaseTrain('master', parse('11.1.0-next.0')),
      }),
    );

    await expectStagingAndPublishWithCherryPick(
      action,
      '10.1.x',
      '10.1.0-rc.0',
      'do-not-use-exceptional-minor',
      {willShowAsLatestOnGitHub: false},
    );
  });

  it('should generate release notes capturing changes to the previous pre-release', async () => {
    const action = setupReleaseActionForTesting(
      CutExceptionalMinorReleaseCandidateAction,
      new ActiveReleaseTrains({
        latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
        releaseCandidate: new ReleaseTrain('11.0.x', parse('11.0.0-next.0')),
        next: new ReleaseTrain('master', parse('11.1.0-next.0')),
      }),
      {useSandboxGitClient: true},
    );

    SandboxGitRepo.withInitialCommit(action.githubConfig)
      .branchOff('10.1.x')
      .commit('feat(pkg1): already released *1')
      .createTagForHead('10.1.0-next.1')
      .commit('fix(pkg1): not yet released *2');

    await expectGithubApiRequests(action, '10.1.x', '10.1.0-rc.0', {
      withCherryPicking: true,
      willShowAsLatestOnGitHub: false,
    });
    await action.instance.perform();

    const changelog = readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

    expect(changelog).toMatch(changelogPattern`
      # 10.1.0-rc.0 <..>
      ### pkg1
      | Commit | Type | Description |
      | -- | -- | -- |
      | <..> | fix | not yet released *2 |
      ## Special Thanks
    `);
  });

  it(
    'should generate release notes capturing changes to the current patch if the ' +
      'current exceptional minor has not been published yet',
    async () => {
      const action = setupReleaseActionForTesting(
        CutExceptionalMinorReleaseCandidateAction,
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('10.0.x', parse('10.0.1')),
          exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-next.0')),
          releaseCandidate: new ReleaseTrain('11.0.x', parse('11.0.0-next.0')),
          next: new ReleaseTrain('master', parse('11.1.0-next.0')),
        }),
        {useSandboxGitClient: true, isExceptionalMinorPublishedToNpm: false},
      );

      SandboxGitRepo.withInitialCommit(action.githubConfig)
        .branchOff('10.0.x')
        .commit('feat(pkg1): patch, already released *1')
        .createTagForHead('10.0.1')
        .commit('feat(pkg1): patch, not released')
        .branchOff('10.1.x')
        .commit('fix(pkg1): not yet released *2');

      await expectGithubApiRequests(action, '10.1.x', '10.1.0-rc.0', {
        willShowAsLatestOnGitHub: false,
        withCherryPicking: true,
      });
      await action.instance.perform();

      const changelog = readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

      expect(changelog).toMatch(changelogPattern`
      # 10.1.0-rc.0 <..>
      ### pkg1
      | Commit | Type | Description |
      | -- | -- | -- |
      | <..> | feat | patch, not released |
      | <..> | fix | not yet released *2 |
      ## Special Thanks
    `);
    },
  );
});
