/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import {join} from 'path';
import * as semver from 'semver';

import {getBranchPushMatcher} from '../../../utils/testing';
import {_npmPackageInfoCache} from '../../versioning';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import * as npm from '../../versioning/npm-publish';
import {ReleaseTrain} from '../../versioning/release-trains';
import {ReleaseAction} from '../actions';
import {actions} from '../actions/index';
import {changelogPath} from '../constants';
import {ReleaseNotes} from '../release-notes/release-notes';

import {fakeNpmPackageQueryRequest, getChangelogForVersion, getTestingMocksForReleaseAction, parse, setupReleaseActionForTesting, testTmpDir} from './test-utils';

describe('common release action logic', () => {
  const baseReleaseTrains: ActiveReleaseTrains = {
    releaseCandidate: null,
    next: new ReleaseTrain('master', parse('10.1.0-next.0')),
    latest: new ReleaseTrain('10.0.x', parse('10.0.1')),
  };

  describe('version computation', async () => {
    const testReleaseTrain: ActiveReleaseTrains = {
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.3')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.1')),
    };

    it('should not modify release train versions and cause invalid other actions', async () => {
      const {releaseConfig, gitClient} = getTestingMocksForReleaseAction();
      const descriptions: string[] = [];

      // Fake the NPM package request as otherwise the test would rely on `npmjs.org`.
      fakeNpmPackageQueryRequest(releaseConfig.npmPackages[0], {'dist-tags': {}});

      for (const actionCtor of actions) {
        if (await actionCtor.isActive(testReleaseTrain)) {
          const action = new actionCtor(testReleaseTrain, gitClient, releaseConfig, testTmpDir);
          descriptions.push(await action.getDescription());
        }
      }

      expect(descriptions).toEqual([
        `Cut a first release-candidate for the feature-freeze branch (v10.1.0-rc.0).`,
        `Cut a new patch release for the "10.0.x" branch (v10.0.2).`,
        `Cut a new next pre-release for the "10.1.x" branch (v10.1.0-next.4).`,
        `Cut a new release for an active LTS branch (0 active).`
      ]);
    });
  });

  describe('build and publishing', () => {
    it('should support a custom NPM registry', async () => {
      const {repo, instance, releaseConfig} =
          setupReleaseActionForTesting(TestAction, baseReleaseTrains);
      const {version, branchName} = baseReleaseTrains.next;
      const tagName = version.format();
      const customRegistryUrl = 'https://custom-npm-registry.google.com';

      repo.expectBranchRequest(branchName, 'STAGING_SHA')
          .expectCommitRequest('STAGING_SHA', `release: cut the v${version} release`)
          .expectTagToBeCreated(tagName, 'STAGING_SHA')
          .expectReleaseToBeCreated(`v${version}`, tagName);

      // Set up a custom NPM registry.
      releaseConfig.publishRegistry = customRegistryUrl;

      await instance.testBuildAndPublish(version, branchName, 'latest');

      expect(npm.runNpmPublish).toHaveBeenCalledTimes(2);
      expect(npm.runNpmPublish)
          .toHaveBeenCalledWith(`${testTmpDir}/dist/pkg1`, 'latest', customRegistryUrl);
      expect(npm.runNpmPublish)
          .toHaveBeenCalledWith(`${testTmpDir}/dist/pkg2`, 'latest', customRegistryUrl);
    });
  });

  describe('changelog cherry-picking', () => {
    const {version, branchName} = baseReleaseTrains.latest;
    const fakeReleaseNotes = getChangelogForVersion(version.format());
    const forkBranchName = `changelog-cherry-pick-${version}`;

    it('should prepend the changelog to the next branch', async () => {
      const {repo, fork, instance, testTmpDir} =
          setupReleaseActionForTesting(TestAction, baseReleaseTrains);

      // Expect the changelog to be fetched and return a fake changelog to test that
      // it is properly appended. Also expect a pull request to be created in the fork.
      repo.expectChangelogFetch(branchName, fakeReleaseNotes)
          .expectFindForkRequest(fork)
          .expectPullRequestToBeCreated('master', fork, forkBranchName, 200)
          .expectPullRequestWait(200);

      // Simulate that the fork branch name is available.
      fork.expectBranchRequest(forkBranchName, null);

      await instance.testCherryPickWithPullRequest(version, branchName);

      const changelogContent = readFileSync(join(testTmpDir, changelogPath), 'utf8');
      expect(changelogContent).toEqual(`${fakeReleaseNotes}Existing changelog`);
    });

    it('should push changes to a fork for creating a pull request', async () => {
      const {repo, fork, instance, gitClient} =
          setupReleaseActionForTesting(TestAction, baseReleaseTrains);

      // Expect the changelog to be fetched and return a fake changelog to test that
      // it is properly appended. Also expect a pull request to be created in the fork.
      repo.expectChangelogFetch(branchName, fakeReleaseNotes)
          .expectFindForkRequest(fork)
          .expectPullRequestToBeCreated('master', fork, forkBranchName, 200)
          .expectPullRequestWait(200);

      // Simulate that the fork branch name is available.
      fork.expectBranchRequest(forkBranchName, null);

      await instance.testCherryPickWithPullRequest(version, branchName);

      expect(gitClient.pushed.length).toBe(1);
      expect(gitClient.pushed[0]).toEqual(getBranchPushMatcher({
        targetBranch: forkBranchName,
        targetRepo: fork,
        baseBranch: 'master',
        baseRepo: repo,
        expectedCommits: [{
          message: `docs: release notes for the v${version} release`,
          files: ['CHANGELOG.md'],
        }],
      }));
    });
  });
});

/**
 * Test release action that exposes protected units of the base
 * release action class. This allows us to add unit tests.
 */
class TestAction extends ReleaseAction {
  async getDescription() {
    return 'Test action';
  }

  async perform() {
    throw Error('Not implemented.');
  }

  async testBuildAndPublish(version: semver.SemVer, publishBranch: string, distTag: string) {
    const releaseNotes = await ReleaseNotes.fromLatestTagToHead(version, this.config);
    await this.buildAndPublish(releaseNotes, publishBranch, distTag);
  }

  async testCherryPickWithPullRequest(version: semver.SemVer, branch: string) {
    const releaseNotes = await ReleaseNotes.fromLatestTagToHead(version, this.config);
    await this.cherryPickChangelogIntoNextBranch(releaseNotes, branch);
  }
}
