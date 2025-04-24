/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import semver from 'semver';

import {CommitFromGitLog, parseCommitFromGitLog} from '../../../commit-message/parse.js';
import {GitClient} from '../../../utils/git/git-client.js';
import {Log} from '../../../utils/logging.js';
import {
  getBranchPushMatcher,
  getMockGitClient,
  SandboxGitRepo,
  testTmpDir,
} from '../../../utils/testing/index.js';
import {ReleaseConfig} from '../../config/index.js';
import {ReleaseNotes, workspaceRelativeChangelogPath} from '../../notes/release-notes.js';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains.js';
import {NpmCommand} from '../../versioning/npm-command.js';
import {ReleaseTrain} from '../../versioning/release-trains.js';
import {actions} from '../actions/index.js';
import {githubReleaseBodyLimit} from '../constants.js';
import {DelegateTestAction} from './delegate-test-action.js';
import {getTestConfigurationsForAction, testReleasePackages} from './test-utils/action-mocks.js';
import {expectGithubApiRequests} from './test-utils/staging-test.js';
import {
  changelogPattern,
  fakeNpmPackageQueryRequest,
  parse,
  setupReleaseActionForTesting,
  writePackageJson,
} from './test-utils/test-utils.js';

describe('common release action logic', () => {
  const baseReleaseTrains = new ActiveReleaseTrains({
    exceptionalMinor: null,
    releaseCandidate: null,
    next: new ReleaseTrain('master', parse('10.1.0-next.0')),
    latest: new ReleaseTrain('10.0.x', parse('10.0.1')),
  });

  describe('version computation', () => {
    it('should not modify release train versions and cause invalid other actions', async () => {
      const testReleaseTrain = new ActiveReleaseTrains({
        exceptionalMinor: null,
        releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.3')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.1')),
      });

      const {releaseConfig, githubConfig} = getTestConfigurationsForAction();
      const gitClient = getMockGitClient(githubConfig, /* useSandboxGitClient */ false);
      const descriptions: string[] = [];

      // Fake the NPM package request as otherwise the test would rely on `npmjs.org`.
      fakeNpmPackageQueryRequest(releaseConfig.representativeNpmPackage, {'dist-tags': {}});

      for (const actionCtor of actions) {
        if (await actionCtor.isActive(testReleaseTrain, releaseConfig)) {
          const action = new actionCtor(testReleaseTrain, gitClient, releaseConfig, testTmpDir);
          descriptions.push(await action.getDescription());
        }
      }

      expect(descriptions).toEqual([
        `Cut a first release-candidate for the "10.1.x" branch (v10.1.0-rc.0).`,
        `Cut a new patch release for the "10.0.x" branch (v10.0.2).`,
        `Cut a new pre-release for the "10.1.x" branch (v10.1.0-next.4).`,
        `Configure the "master" branch to be released as major (v11.0.0-next.0).`,
        `Cut a new release for an active LTS branch (0 active).`,
      ]);
    });

    it('should properly show descriptions when a major is in RC-phase', async () => {
      const testReleaseTrain = new ActiveReleaseTrains({
        exceptionalMinor: null,
        releaseCandidate: new ReleaseTrain('15.0.x', parse('15.0.0-rc.1')),
        next: new ReleaseTrain('main', parse('15.1.0-next.0')),
        latest: new ReleaseTrain('14.3.x', parse('14.3.1')),
      });

      const {releaseConfig, githubConfig} = getTestConfigurationsForAction();
      const gitClient = getMockGitClient(githubConfig, /* useSandboxGitClient */ false);
      const descriptions: string[] = [];

      // Fake the NPM package request as otherwise the test would rely on `npmjs.org`.
      fakeNpmPackageQueryRequest(releaseConfig.representativeNpmPackage, {'dist-tags': {}});

      for (const actionCtor of actions) {
        if (await actionCtor.isActive(testReleaseTrain, releaseConfig)) {
          const action = new actionCtor(testReleaseTrain, gitClient, releaseConfig, testTmpDir);
          descriptions.push(await action.getDescription());
        }
      }

      expect(descriptions).toEqual([
        'Cut a stable release for the "15.0.x" branch — published as `@next` (v15.0.0).',
        'Cut a new patch release for the "14.3.x" branch (v14.3.2).',
        `Cut a new pre-release for the "15.0.x" branch (v15.0.0-rc.2).`,
        `Configure the "main" branch to be released as major (v16.0.0-next.0).`,
        `Prepare an exceptional minor based on the existing "14.3.x" branch (14.4.x).`,
        `Cut a new release for an active LTS branch (0 active).`,
      ]);
    });

    it('should show actions when an exceptional minor is in-progress', async () => {
      const testReleaseTrain = new ActiveReleaseTrains({
        latest: new ReleaseTrain('14.3.x', parse('14.3.1')),
        exceptionalMinor: new ReleaseTrain('14.4.x', parse('14.4.0-next.0')),
        releaseCandidate: new ReleaseTrain('15.0.x', parse('15.0.0-rc.1')),
        next: new ReleaseTrain('main', parse('15.1.0-next.0')),
      });

      const {releaseConfig, githubConfig} = getTestConfigurationsForAction();
      const gitClient = getMockGitClient(githubConfig, /* useSandboxGitClient */ false);
      const descriptions: string[] = [];

      // Fake the NPM package request as otherwise the test would rely on `npmjs.org`.
      fakeNpmPackageQueryRequest(releaseConfig.representativeNpmPackage, {'dist-tags': {}});

      for (const actionCtor of actions) {
        if (await actionCtor.isActive(testReleaseTrain, releaseConfig)) {
          const action = new actionCtor(testReleaseTrain, gitClient, releaseConfig, testTmpDir);
          descriptions.push(await action.getDescription());
        }
      }

      expect(descriptions).toEqual([
        `Exceptional Minor: Cut a first release-candidate for the "14.4.x" branch (v14.4.0-rc.0).`,
        `Exceptional Minor: Cut a new pre-release for the "14.4.x" branch (v14.4.0-next.0).`,
        'Cut a new patch release for the "14.3.x" branch (v14.3.2).',
        `Cut a new pre-release for the "15.0.x" branch (v15.0.0-rc.2).`,
        `Configure the "main" branch to be released as major (v16.0.0-next.0).`,
        `Cut a new release for an active LTS branch (0 active).`,
      ]);
    });

    it('should show actions when an exceptional minor is ready for becoming "stable"', async () => {
      const testReleaseTrain = new ActiveReleaseTrains({
        latest: new ReleaseTrain('14.3.x', parse('14.3.1')),
        exceptionalMinor: new ReleaseTrain('14.4.x', parse('14.4.0-rc.3')),
        releaseCandidate: new ReleaseTrain('15.0.x', parse('15.0.0-rc.1')),
        next: new ReleaseTrain('main', parse('15.1.0-next.0')),
      });

      const {releaseConfig, githubConfig} = getTestConfigurationsForAction();
      const gitClient = getMockGitClient(githubConfig, /* useSandboxGitClient */ false);
      const descriptions: string[] = [];

      // Fake the NPM package request as otherwise the test would rely on `npmjs.org`.
      fakeNpmPackageQueryRequest(releaseConfig.representativeNpmPackage, {'dist-tags': {}});

      for (const actionCtor of actions) {
        if (await actionCtor.isActive(testReleaseTrain, releaseConfig)) {
          const action = new actionCtor(testReleaseTrain, gitClient, releaseConfig, testTmpDir);
          descriptions.push(await action.getDescription());
        }
      }

      expect(descriptions).toEqual([
        `Exceptional Minor: Cut a new pre-release for the "14.4.x" branch (v14.4.0-rc.4).`,
        `Cut a stable release for the "14.4.x" branch — published as \`@latest\` (v14.4.0).`,
        'Cut a new patch release for the "14.3.x" branch (v14.3.2).',
        `Cut a new pre-release for the "15.0.x" branch (v15.0.0-rc.2).`,
        `Configure the "main" branch to be released as major (v16.0.0-next.0).`,
        `Cut a new release for an active LTS branch (0 active).`,
      ]);
    });
  });

  describe('publishing', () => {
    it('should support a custom NPM registry', async () => {
      const {repo, instance, releaseConfig, builtPackagesWithInfo} = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
      );
      const {version, branchName} = baseReleaseTrains.next;
      const tagName = version.format();
      const customRegistryUrl = 'https://custom-npm-registry.google.com';

      repo
        .expectBranchRequest(branchName, {
          sha: 'STAGING_SHA',
          parents: [{sha: 'BEFORE_STAGING_SHA'}],
          commit: {message: `release: cut the v${version} release`},
        })
        .expectTagToBeCreated(tagName, 'STAGING_SHA')
        .expectReleaseToBeCreated(version.toString(), tagName, true);

      // Set up a custom NPM registry.
      releaseConfig.publishRegistry = customRegistryUrl;

      await instance.testPublish(
        builtPackagesWithInfo,
        version,
        branchName,
        'BEFORE_STAGING_SHA',
        'latest',
      );

      expect(NpmCommand.publish).toHaveBeenCalledTimes(testReleasePackages.length);

      for (const pkg of testReleasePackages) {
        expect(NpmCommand.publish).toHaveBeenCalledWith(
          `${testTmpDir}/dist/${pkg.name}`,
          'latest',
          customRegistryUrl,
        );
      }
    });

    it('should capture release notes in release entry', async () => {
      const {repo, instance, githubConfig, builtPackagesWithInfo} = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
        {useSandboxGitClient: true},
      );
      const {version, branchName} = baseReleaseTrains.next;
      const tagName = version.format();

      SandboxGitRepo.withInitialCommit(githubConfig)
        .createTagForHead('startTagForNotes')
        .commit('feat(test): first commit')
        .commit('feat(test): second commit');

      repo
        .expectBranchRequest(branchName, {
          sha: 'STAGING_SHA',
          parents: [{sha: 'BEFORE_STAGING_SHA'}],
          commit: {message: `release: cut the v${version} release`},
        })
        .expectTagToBeCreated(tagName, 'STAGING_SHA')
        .expectReleaseToBeCreated(
          version.toString(),
          tagName,
          true,
          changelogPattern`
            ### test
            | Commit | Description |
            | -- | -- |
            | <..> | first commit |
            | <..> | second commit |
          `,
        );

      await instance.testPublish(
        builtPackagesWithInfo,
        version,
        branchName,
        'BEFORE_STAGING_SHA',
        'latest',
        'startTagForNotes',
      );
    });

    it('should not allow for arbitrary edits to be made during changelog edit prompt', async () => {
      const {repo, fork, instance, githubConfig, promptConfirmSpy} = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
        {useSandboxGitClient: true},
      );
      const {version, branchName} = baseReleaseTrains.next;

      spyOn(Log, 'error');

      let promptResolveFn: ((value: boolean) => void) | null = null;
      const promptPromise = new Promise<boolean>(
        (resolve) => (promptResolveFn = resolve),
      ) as unknown as Promise<boolean> & {cancel: () => void};
      promptConfirmSpy.and.returnValue(promptPromise);

      const testFile = join(testTmpDir, 'some-file.txt');
      const git =
        SandboxGitRepo.withInitialCommit(githubConfig).createTagForHead('0.0.0-compare-base');

      writeFileSync(testFile, 'content');
      git.commit('feat(test): first commit');

      repo
        .expectBranchRequest(branchName, {
          sha: 'STAGING_SHA',
          commit: {message: `release: cut the v${version} release`},
        })
        .expectCommitStatusCheck('STAGING_SHA', 'success')
        .expectFindForkRequest(fork)
        .expectPullRequestToBeCreated(branchName, fork, 'release-stage-10.1.0-next.0', 10);

      fork.expectBranchRequest('release-stage-10.1.0-next.0');

      const stagingPromise = instance.testStagingWithBuild(
        version,
        branchName,
        parse('0.0.0-compare-base'),
      );

      // Before confirming that we are good with the changelog changes, modify
      // an unrelated file. This should trigger a release action fatal error.
      writeFileSync(testFile, 'change content');
      promptResolveFn!(true);

      await expectAsync(stagingPromise).toBeRejected();

      expect(Log.error).toHaveBeenCalledWith(
        jasmine.stringContaining(
          'Unrelated changes have been made as part of the changelog editing',
        ),
      );
    });

    it('should link to the changelog in the release entry if notes are too large', async () => {
      const {repo, instance, gitClient, builtPackagesWithInfo, releaseConfig} =
        setupReleaseActionForTesting(DelegateTestAction, baseReleaseTrains);
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
        async () => new MockReleaseNotes(releaseConfig, version, [testCommit], gitClient),
      );

      repo
        .expectBranchRequest(branchName, {
          sha: 'STAGING_SHA',
          parents: [{sha: 'BEFORE_STAGING_SHA'}],
          commit: {message: `release: cut the v${version} release`},
        })
        .expectTagToBeCreated(tagName, 'STAGING_SHA')
        .expectReleaseToBeCreated(
          version.toString(),
          tagName,
          true,
          changelogPattern`
            Release notes are too large to be captured here. [View all changes here](https://github.com/angular/dev-infra-test/blob/10.0.1/CHANGELOG.md#10.0.1).
          `,
        );

      await instance.testPublish(
        builtPackagesWithInfo,
        version,
        branchName,
        'BEFORE_STAGING_SHA',
        'latest',
      );
    });

    it('should ensure that no new changes have landed after release staging has started', async () => {
      const {repo, instance, builtPackagesWithInfo} = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
      );
      const {version, branchName} = baseReleaseTrains.latest;

      repo.expectBranchRequest(branchName, {
        sha: 'STAGING_SHA',
        parents: [{sha: 'THE_ONE_BEFORE_STAGING_SHA'}],
        commit: {message: `release: cut the v${version} release`},
      });

      spyOn(Log, 'error');

      await expectAsync(
        instance.testPublish(
          builtPackagesWithInfo,
          version,
          branchName,
          'BEFORE_STAGING_SHA',
          'latest',
        ),
      ).toBeRejected();

      expect(Log.error).toHaveBeenCalledTimes(2);
      expect(Log.error).toHaveBeenCalledWith(
        jasmine.stringMatching('additional commits have landed while staging the release'),
      );
      expect(Log.error).toHaveBeenCalledWith(
        jasmine.stringMatching('revert the bump commit and retry, or cut a new version on top'),
      );
    });

    it('should ensure that the release output has not been modified during staging', async () => {
      const action = setupReleaseActionForTesting(DelegateTestAction, baseReleaseTrains, {
        stubBuiltPackageOutputChecks: false,
      });
      const {version, branchName} = baseReleaseTrains.latest;

      await writePackageJson('@angular/pkg1', '10.0.1');
      await writePackageJson('@angular/pkg2', '10.0.1');
      await writePackageJson('@experimental/somepkg', '0.1000.1');

      await expectGithubApiRequests(action, branchName, version.format(), {
        withCherryPicking: false,
        willShowAsLatestOnGitHub: true,
      });

      spyOn(Log, 'error');

      const {builtPackagesWithInfo} = await action.instance.testStagingWithBuild(
        version,
        branchName,
        parse('0.0.0-compare-base'),
      );

      // We built the release packages and the release tool hashed the contents.
      // Now we modify the release output and expect the tool to abort.
      await writePackageJson('@angular/pkg1', '0.0.0-accidentally-modified');

      await expectAsync(
        action.instance.testPublish(
          builtPackagesWithInfo,
          version,
          branchName,
          'PRE_STAGING_SHA',
          'latest',
        ),
      ).toBeRejected();

      expect(Log.error).toHaveBeenCalledTimes(2);
      expect(Log.error).toHaveBeenCalledWith(
        jasmine.stringMatching(' Release output has been modified locally since it was built'),
      );
    });
  });

  describe('changelog cherry-picking', () => {
    const {version, branchName} = baseReleaseTrains.latest;
    const forkBranchName = `changelog-cherry-pick-${version}`;

    it('should prepend the changelog to the next branch', async () => {
      const {repo, fork, instance, projectDir} = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
      );

      // Expect the changelog to be fetched and return a fake changelog to test that
      // it is properly appended. Also expect a pull request to be created in the fork.
      repo
        .expectFindForkRequest(fork)
        .expectPullRequestToBeCreated('master', fork, forkBranchName, 200)
        .expectPullRequestMergeCheck(200, false)
        .expectPullRequestMerge(200);

      // Simulate that the fork branch name is available.
      fork.expectBranchRequest(forkBranchName);

      await instance.testCherryPickWithPullRequest(version, branchName);

      const changelogContent = readFileSync(
        join(projectDir, workspaceRelativeChangelogPath),
        'utf8',
      );
      expect(changelogContent).toMatch(changelogPattern`
        # 10.0.1 <..>

        <!-- CHANGELOG SPLIT MARKER -->

        <a name="0.0.0"></a>
        Existing changelog
      `);
    });

    it('should be possible to complete when pull request is merged manually', async () => {
      const {repo, fork, instance, gitClient} = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
      );

      repo
        .expectFindForkRequest(fork)
        .expectPullRequestToBeCreated('master', fork, forkBranchName, 200)
        .expectPullRequestMergeCheck(200, true);

      // Simulate that the fork branch name is available.
      fork.expectBranchRequest(forkBranchName);

      await instance.testCherryPickWithPullRequest(version, branchName);

      expect(gitClient.pushed.length).toBe(1);
    });

    it('should push changes to a fork for creating a pull request', async () => {
      const {repo, fork, instance, gitClient} = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
      );

      // Expect the changelog to be fetched and return a fake changelog to test that
      // it is properly appended. Also expect a pull request to be created in the fork.
      repo
        .expectFindForkRequest(fork)
        .expectPullRequestToBeCreated('master', fork, forkBranchName, 200)
        .expectPullRequestMergeCheck(200, false)
        .expectPullRequestMerge(200);

      // Simulate that the fork branch name is available.
      fork.expectBranchRequest(forkBranchName);

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
  constructor(
    releaseConfig: ReleaseConfig,
    version: semver.SemVer,
    commits: CommitFromGitLog[],
    git: GitClient,
  ) {
    const ngDevConfig = {
      release: releaseConfig,
      __isNgDevConfigObject: true,
    };

    super(ngDevConfig, version, commits, git);
  }
}
