/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReleaseTrain} from '../../versioning/release-trains.js';
import {CutNewPatchAction} from '../actions/cut-new-patch.js';
import {changelogPattern, parse, setupReleaseActionForTesting} from './test-utils/test-utils.js';
import {
  expectGithubApiRequestsForStaging,
  expectStagingAndPublishWithCherryPick,
} from './test-utils/staging-test.js';
import {readFileSync} from 'fs';
import {testTmpDir, SandboxGitRepo} from '../../../utils/testing/index.js';
import {ActiveReleaseTrains} from '../../versioning/index.js';

describe('cut new patch action', () => {
  it('should be active', async () => {
    expect(
      await CutNewPatchAction.isActive(
        new ActiveReleaseTrains({
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.1.0-next.3')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(true);
  });

  it('should compute proper new version and select correct branch', async () => {
    const action = setupReleaseActionForTesting(
      CutNewPatchAction,
      new ActiveReleaseTrains({
        releaseCandidate: null,
        next: new ReleaseTrain('master', parse('10.1.0-next.3')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
      }),
    );

    await expectStagingAndPublishWithCherryPick(action, '10.0.x', '10.0.3', 'latest');
  });

  it('should create a proper new version if there is a feature-freeze release-train', async () => {
    const action = setupReleaseActionForTesting(
      CutNewPatchAction,
      new ActiveReleaseTrains({
        releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.3')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.9')),
      }),
    );

    await expectStagingAndPublishWithCherryPick(action, '10.0.x', '10.0.10', 'latest');
  });

  it('should create a proper new version if there is a release-candidate train', async () => {
    const action = setupReleaseActionForTesting(
      CutNewPatchAction,
      new ActiveReleaseTrains({
        releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.9')),
      }),
    );

    await expectStagingAndPublishWithCherryPick(action, '10.0.x', '10.0.10', 'latest');
  });

  it('should generate release notes capturing changes to the previous latest patch version', async () => {
    const action = setupReleaseActionForTesting(
      CutNewPatchAction,
      new ActiveReleaseTrains({
        releaseCandidate: null,
        next: new ReleaseTrain('master', parse('10.1.0-next.3')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
      }),
      true,
      {useSandboxGitClient: true},
    );

    SandboxGitRepo.withInitialCommit(action.githubConfig)
      .branchOff('10.0.x')
      .commit('feat(pkg1): already released *1')
      .commit('feat(pkg1): already released *2')
      .createTagForHead('10.0.2')
      .commit('feat(pkg1): not yet released *1')
      .commit('feat(pkg1): not yet released *2');

    await expectGithubApiRequestsForStaging(action, '10.0.x', '10.0.3', true);
    await action.instance.perform();

    const changelog = readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

    expect(changelog).toMatch(changelogPattern`
      # 10.0.3 <..>
      ### pkg1
      | Commit | Type | Description |
      | -- | -- | -- |
      | <..> | feat | not yet released *1 |
      | <..> | feat | not yet released *2 |
      ## Special Thanks
    `);
  });
});
