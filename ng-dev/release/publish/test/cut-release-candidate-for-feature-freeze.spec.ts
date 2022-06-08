/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReleaseTrain} from '../../versioning/release-trains.js';
import {CutReleaseCandidateForFeatureFreezeAction} from '../actions/cut-release-candidate-for-feature-freeze.js';
import {changelogPattern, parse, setupReleaseActionForTesting} from './test-utils/test-utils.js';
import {
  expectGithubApiRequestsForStaging,
  expectStagingAndPublishWithCherryPick,
} from './test-utils/staging-test.js';
import {readFileSync} from 'fs';
import {testTmpDir, SandboxGitRepo} from '../../../utils/testing/index.js';
import {ActiveReleaseTrains} from '../../versioning/index.js';

describe('cut release candidate for feature-freeze action', () => {
  it('should activate if a feature-freeze release-train is active', async () => {
    expect(
      await CutReleaseCandidateForFeatureFreezeAction.isActive(
        new ActiveReleaseTrains({
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(true);
  });

  it('should not activate if release-candidate release-train is active', async () => {
    expect(
      await CutReleaseCandidateForFeatureFreezeAction.isActive(
        new ActiveReleaseTrains({
          // No longer in feature-freeze but in release-candidate phase.
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(false);
  });

  it('should not activate if no FF/RC release-train is active', async () => {
    expect(
      await CutReleaseCandidateForFeatureFreezeAction.isActive(
        new ActiveReleaseTrains({
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.1.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(false);
  });

  it('should create a proper new version and select correct branch', async () => {
    const action = setupReleaseActionForTesting(
      CutReleaseCandidateForFeatureFreezeAction,
      new ActiveReleaseTrains({
        releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
      }),
    );

    await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0-rc.0', 'next');
  });

  it('should generate release notes capturing changes to the previous pre-release', async () => {
    const action = setupReleaseActionForTesting(
      CutReleaseCandidateForFeatureFreezeAction,
      new ActiveReleaseTrains({
        releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
      }),
      true,
      {useSandboxGitClient: true},
    );

    SandboxGitRepo.withInitialCommit(action.githubConfig)
      .branchOff('10.1.x')
      .commit('feat(pkg1): feature-freeze, already released *1')
      .commit('feat(pkg1): feature-freeze, already released *2')
      .createTagForHead('10.1.0-next.1')
      .commit('feat(pkg1): not yet released *1')
      .commit('fix(pkg1): not yet released *2');

    await expectGithubApiRequestsForStaging(action, '10.1.x', '10.1.0-rc.0', true);
    await action.instance.perform();

    const changelog = readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

    expect(changelog).toMatch(changelogPattern`
      # 10.1.0-rc.0 <..>
      ### pkg1
      | Commit | Type | Description |
      | -- | -- | -- |
      | <..> | feat | not yet released *1 |
      | <..> | fix | not yet released *2 |
      ## Special Thanks
    `);
  });
});
