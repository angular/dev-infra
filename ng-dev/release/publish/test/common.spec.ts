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
import {SemVer} from 'semver';

import {getBranchPushMatcher} from '../../../utils/testing';
import {ReleaseNotes} from '../../notes/release-notes';
import {NpmDistTag} from '../../versioning';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import * as npm from '../../versioning/npm-publish';
import {ReleaseTrain} from '../../versioning/release-trains';
import {ReleaseAction} from '../actions';
import {actions} from '../actions/index';
import {changelogPath, githubReleaseBodyLimit} from '../constants';
import {
  changelogPattern,
  fakeNpmPackageQueryRequest,
  parse,
  setupReleaseActionForTesting,
} from './test-utils/test-utils';
import {
  getTestConfigurationsForAction,
  testReleasePackages,
  testTmpDir,
} from './test-utils/action-mocks';
import {getMockGitClient} from './test-utils/git-client-mock';
import {CommitFromGitLog, parseCommitFromGitLog} from '../../../commit-message/parse';
import {SandboxGitRepo} from './test-utils/sandbox-testing';

describe('common release action logic', () => {
  const baseReleaseTrains: ActiveReleaseTrains = {
    releaseCandidate: null,
    next: new ReleaseTrain('master', parse('10.1.0-next.0')),
    latest: new ReleaseTrain('10.0.x', parse('10.0.1')),
  };

  describe('version computation', () => {
    const testReleaseTrain: ActiveReleaseTrains = {
      releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.3')),
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.0.x', parse('10.0.1')),
    };

    it('should not modify release train versions and cause invalid other actions', async () => {
      const {releaseConfig, githubConfig} = getTestConfigurationsForAction();
      const gitClient = getMockGitClient(githubConfig, /* useSandboxGitClient */ false);
      const descriptions: string[] = [];

      // Fake the NPM package request as otherwise the test would rely on `npmjs.org`.
      fakeNpmPackageQueryRequest(releaseConfig.npmPackages[0], {'dist-tags': {}});

      for (const actionCtor of actions) {
        if (await actionCtor.isActive(testReleaseTrain, releaseConfig)) {
          const action = new actionCtor(testReleaseTrain, gitClient, releaseConfig, testTmpDir);
          descriptions.push(await action.getDescription());
        }
      }

      expect(descriptions).toEqual([
        `Cut a first release-candidate for the feature-freeze branch (v10.1.0-rc.0).`,
        `Cut a new patch release for the "10.0.x" branch (v10.0.2).`,
        `Cut a new next pre-release for the "10.1.x" branch (v10.1.0-next.4).`,
        `Cut a new release for an active LTS branch (0 active).`,
      ]);
    });
  });

  describe('build and publishing', () => {
    it('should support a custom NPM registry', async () => {
      const {repo, instance, releaseConfig} = setupReleaseActionForTesting(
        TestAction,
        baseReleaseTrains,
      );
      const {version, branchName} = baseReleaseTrains.next;
      const tagName = version.format();
      const customRegistryUrl = 'https://custom-npm-registry.google.com';

      repo
        .expectBranchRequest(branchName, 'STAGING_SHA')
        .expectCommitRequest('STAGING_SHA', `release: cut the v${version} release`)
        .expectTagToBeCreated(tagName, 'STAGING_SHA')
        .expectReleaseToBeCreated(`v${version}`, tagName);

      // Set up a custom NPM registry.
      releaseConfig.publishRegistry = customRegistryUrl;

      await instance.testBuildAndPublish(version, branchName, 'latest');

      expect(npm.runNpmPublish).toHaveBeenCalledTimes(testReleasePackages.length);

      for (const pkgName of testReleasePackages) {
        expect(npm.runNpmPublish).toHaveBeenCalledWith(
          `${testTmpDir}/dist/${pkgName}`,
          'latest',
          customRegistryUrl,
        );
      }
    });

    it('should capture release notes in release entry', async () => {
      const {repo, instance, githubConfig} = setupReleaseActionForTesting(
        TestAction,
        baseReleaseTrains,
        /* isNextPublishedToNpm */ true,
        {useSandboxGitClient: true},
      );
      const {version, branchName} = baseReleaseTrains.next;
      const tagName = version.format();

      SandboxGitRepo.withInitialCommit(githubConfig)
        .createTagForHead('startTagForNotes')
        .commit('feat(test): first commit')
        .commit('feat(test): second commit');

      repo
        .expectBranchRequest(branchName, 'STAGING_SHA')
        .expectCommitRequest('STAGING_SHA', `release: cut the v${version} release`)
        .expectTagToBeCreated(tagName, 'STAGING_SHA')
        .expectReleaseToBeCreated(
          `v${version}`,
          tagName,
          changelogPattern`
            # 10.1.0-next.0 <..>
            ### test
            | Commit | Description |
            | -- | -- |
            | <..> | first commit |
            | <..> | second commit |
            ## Special Thanks
          `,
        );

      await instance.testBuildAndPublish(version, branchName, 'latest', 'startTagForNotes');
    });

    it('should link to the changelog in the release entry if notes are too large', async () => {
      const {repo, instance} = setupReleaseActionForTesting(TestAction, baseReleaseTrains);
      const {version, branchName} = baseReleaseTrains.latest;
      const tagName = version.format();
      const testCommit = parseCommitFromGitLog(Buffer.from('fix(test): test'));
      const exceedingText = Array.from(new Array(githubReleaseBodyLimit), () => '#').join('');

      // Note: We cannot directly parse our commit with characters as much as the Github
      // release body limit because the parser does breaks for such unrealistic commit
      // messages. We manually update the commit to contain as much text so that
      // the release notes generation would exceed the Github release body limit.
      // This is faster and simpler than generating actual commits to simulate a case
      // where the API character limit from Github is reached.
      testCommit.subject = exceedingText;

      spyOn(ReleaseNotes, 'forRange').and.callFake(
        async () => new MockReleaseNotes(version, [testCommit]),
      );

      repo
        .expectBranchRequest(branchName, 'STAGING_SHA')
        .expectCommitRequest('STAGING_SHA', `release: cut the v${version} release`)
        .expectTagToBeCreated(tagName, 'STAGING_SHA')
        .expectReleaseToBeCreated(
          `v${version}`,
          tagName,
          changelogPattern`
            Release notes are too large to be captured here. [View all changes here](https://github.com/angular/dev-infra-test/blob/10.0.1/CHANGELOG.md#10.0.1).
          `,
        );

      await instance.testBuildAndPublish(version, branchName, 'latest');
    });
  });

  describe('changelog cherry-picking', () => {
    const {version, branchName} = baseReleaseTrains.latest;
    const forkBranchName = `changelog-cherry-pick-${version}`;

    it('should prepend the changelog to the next branch', async () => {
      const {repo, fork, instance, testTmpDir} = setupReleaseActionForTesting(
        TestAction,
        baseReleaseTrains,
      );

      // Expect the changelog to be fetched and return a fake changelog to test that
      // it is properly appended. Also expect a pull request to be created in the fork.
      repo
        .expectFindForkRequest(fork)
        .expectPullRequestToBeCreated('master', fork, forkBranchName, 200)
        .expectPullRequestWait(200);

      // Simulate that the fork branch name is available.
      fork.expectBranchRequest(forkBranchName, null);

      await instance.testCherryPickWithPullRequest(version, branchName);

      const changelogContent = readFileSync(join(testTmpDir, changelogPath), 'utf8');
      expect(changelogContent).toMatch(changelogPattern`
        # 10.0.1 <..>


        Existing changelog
      `);
    });

    it('should push changes to a fork for creating a pull request', async () => {
      const {repo, fork, instance, gitClient} = setupReleaseActionForTesting(
        TestAction,
        baseReleaseTrains,
      );

      // Expect the changelog to be fetched and return a fake changelog to test that
      // it is properly appended. Also expect a pull request to be created in the fork.
      repo
        .expectFindForkRequest(fork)
        .expectPullRequestToBeCreated('master', fork, forkBranchName, 200)
        .expectPullRequestWait(200);

      // Simulate that the fork branch name is available.
      fork.expectBranchRequest(forkBranchName, null);

      await instance.testCherryPickWithPullRequest(version, branchName);

      expect(gitClient.pushed.length).toBe(1);
      expect(gitClient.pushed[0]).toEqual(
        getBranchPushMatcher({
          targetBranch: forkBranchName,
          targetRepo: fork,
          baseBranch: 'master',
          baseRepo: repo,
          expectedCommits: [
            {
              message: `docs: release notes for the v${version} release`,
              files: ['CHANGELOG.md'],
            },
          ],
        }),
      );
    });
  });
});

/** Mock class for `ReleaseNotes` which accepts a list of in-memory commit objects. */
class MockReleaseNotes extends ReleaseNotes {
  constructor(version: SemVer, commits: CommitFromGitLog[]) {
    super(version, commits);
  }
}

/**
 * Test release action that exposes protected units of the base
 * release action class. This allows us to add unit tests.
 */
class TestAction extends ReleaseAction {
  override async getDescription() {
    return 'Test action';
  }

  override async perform() {
    throw Error('Not implemented.');
  }

  async testBuildAndPublish(
    version: semver.SemVer,
    publishBranch: string,
    distTag: NpmDistTag,
    releaseNotesCompareTag = 'HEAD',
  ) {
    const releaseNotes = await ReleaseNotes.forRange(version, releaseNotesCompareTag, 'HEAD');
    debugger;
    await this.buildAndPublish(releaseNotes, publishBranch, distTag);
  }

  async testCherryPickWithPullRequest(version: semver.SemVer, branch: string) {
    const releaseNotes = await ReleaseNotes.forRange(version, '', '');
    await this.cherryPickChangelogIntoNextBranch(releaseNotes, branch);
  }
}
