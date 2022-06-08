/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SandboxGitRepo} from '../../../utils/testing/index.js';
import {ActiveReleaseTrains} from '../../versioning/index.js';
import {ReleaseTrain} from '../../versioning/release-trains.js';
import {MoveNextIntoFeatureFreezeAction} from '../actions/move-next-into-feature-freeze.js';

import {
  expectBranchOffActionToRun,
  prepareBranchOffActionForChangelog,
} from './branch-off-next-branch-testing.js';
import {changelogPattern, parse} from './test-utils/test-utils.js';

describe('move next into feature-freeze action', () => {
  it('should not activate if a feature-freeze release-train is active', async () => {
    expect(
      await MoveNextIntoFeatureFreezeAction.isActive(
        new ActiveReleaseTrains({
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(false);
  });

  it('should not activate if release-candidate release-train is active', async () => {
    expect(
      await MoveNextIntoFeatureFreezeAction.isActive(
        new ActiveReleaseTrains({
          // No longer in feature-freeze but in release-candidate phase.
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(false);
  });

  it('should not activate if the next release-train is for a minor', async () => {
    expect(
      await MoveNextIntoFeatureFreezeAction.isActive(
        new ActiveReleaseTrains({
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.1.0-next.2')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(false);
  });

  it('should activate if no FF/RC release-train is active', async () => {
    expect(
      await MoveNextIntoFeatureFreezeAction.isActive(
        new ActiveReleaseTrains({
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('11.0.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(true);
  });

  it('should create pull requests and feature-freeze branch', async () => {
    await expectBranchOffActionToRun(
      MoveNextIntoFeatureFreezeAction,
      new ActiveReleaseTrains({
        releaseCandidate: null,
        next: new ReleaseTrain('master', parse('10.1.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
      }),
      /* isNextPublishedToNpm */ true,
      '10.2.0-next.0',
      '10.1.0-next.1',
      '10.1.x',
    );
  });

  // This is test for a special case in the release tooling. Whenever we branch off for
  // feature-freeze, we immediately bump the version in the `next` branch but do not publish
  // it. We special-case this by not incrementing the version if the version in the next
  // branch has not been published yet.
  describe('current next version has not been published', () => {
    it('should not increment the version', async () => {
      await expectBranchOffActionToRun(
        MoveNextIntoFeatureFreezeAction,
        new ActiveReleaseTrains({
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.1.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
        /* isNextPublishedToNpm */ false,
        '10.2.0-next.0',
        '10.1.0-next.0',
        '10.1.x',
      );
    });

    it(
      'should generate release notes capturing changes to the latest patch while deduping ' +
        'changes that have also landed in the current patch',
      async () => {
        const {action, buildChangelog} = prepareBranchOffActionForChangelog(
          MoveNextIntoFeatureFreezeAction,
          new ActiveReleaseTrains({
            releaseCandidate: null,
            next: new ReleaseTrain('master', parse('10.1.0-next.0')),
            latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
          }),
          /* isNextPublishedToNpm */ false,
          '10.2.0-next.0',
          '10.1.0-next.0',
          '10.1.x',
        );

        SandboxGitRepo.withInitialCommit(action.githubConfig)
          .branchOff('10.0.x')
          .commit('feat(pkg1): patch already released *1')
          .commit('feat(pkg1): patch already released *2')
          .commit('feat(pkg1): released in patch, but cherry-picked', 1)
          .createTagForHead('10.0.3')
          .commit('feat(pkg1): not released yet, but cherry-picked', 2)
          .switchToBranch('master')
          .commit('feat(pkg1): only in next, not released yet *1')
          .commit('feat(pkg1): only in next, not released yet *2')
          .cherryPick(1)
          .cherryPick(2);

        expect(await buildChangelog()).toMatch(changelogPattern`
        # 10.1.0-next.0 <..>
        ### pkg1
        | Commit | Type | Description |
        | -- | -- | -- |
        | <..> | feat | not released yet, but cherry-picked |
        | <..> | feat | only in next, not released yet *1 |
        | <..> | feat | only in next, not released yet *2 |
      `);
      },
    );
  });

  it('should generate release notes capturing changes to the previous next pre-release', async () => {
    const {action, buildChangelog} = prepareBranchOffActionForChangelog(
      MoveNextIntoFeatureFreezeAction,
      new ActiveReleaseTrains({
        releaseCandidate: null,
        next: new ReleaseTrain('master', parse('10.1.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
      }),
      /* isNextPublishedToNpm */ true,
      '10.2.0-next.0',
      '10.1.0-next.1',
      '10.1.x',
    );

    SandboxGitRepo.withInitialCommit(action.githubConfig)
      .commit('feat(pkg1): already released *1')
      .commit('feat(pkg1): already released *2')
      .createTagForHead('10.1.0-next.0')
      .commit('feat(pkg1): not yet released *1')
      .commit('fix(pkg1): not yet released *2');

    expect(await buildChangelog()).toMatch(changelogPattern`
      # 10.1.0-next.1 <..>
      ### pkg1
      | Commit | Type | Description |
      | -- | -- | -- |
      | <..> | feat | not yet released *1 |
      | <..> | fix | not yet released *2 |
      ## Special Thanks
    `);
  });
});
