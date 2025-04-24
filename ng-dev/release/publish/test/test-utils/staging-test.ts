/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getBranchPushMatcher, testTmpDir} from '../../../../utils/testing/index.js';
import {NpmPackage} from '../../../config/index.js';
import {NpmDistTag} from '../../../versioning/index.js';
import {NpmCommand} from '../../../versioning/npm-command.js';
import {ReleaseAction} from '../../actions.js';
import {ExternalCommands} from '../../external-commands.js';
import {testReleasePackages} from './action-mocks.js';
import {TestReleaseAction} from './test-action.js';

type TestActionWithMockGitClient = TestReleaseAction<ReleaseAction, {useSandboxGitClient: false}>;

/**
 * Expects and fakes the necessary Github API requests for staging
 * process of a given version.
 */
export async function expectGithubApiRequestsForStaging(
  action: Omit<TestReleaseAction, 'gitClient'>,
  expectedBranch: string,
  expectedVersion: string,
  opts: {withCherryPicking: boolean},
) {
  const {repo, fork} = action;
  const expectedStagingForkBranch = `release-stage-${expectedVersion}`;

  // We first mock the commit status check for the next branch, then expect two pull
  // requests from a fork that are targeting next and the new feature-freeze branch.
  repo
    .expectBranchRequest(expectedBranch, {sha: 'PRE_STAGING_SHA'})
    .expectCommitStatusCheck('PRE_STAGING_SHA', 'success')
    .expectFindForkRequest(fork)
    .expectPullRequestToBeCreated(expectedBranch, fork, expectedStagingForkBranch, 200)
    .expectPullRequestMergeCheck(200, false)
    .expectPullRequestMerge(200);

  // In the fork, we make the staging branch appear as non-existent,
  // so that the PR can be created properly without collisions.
  fork.expectBranchRequest(expectedStagingForkBranch);

  if (opts.withCherryPicking) {
    const expectedCherryPickForkBranch = `changelog-cherry-pick-${expectedVersion}`;

    repo
      .expectPullRequestToBeCreated('master', fork, expectedCherryPickForkBranch, 300)
      .expectPullRequestMergeCheck(300, false)
      .expectPullRequestMerge(300);

    // In the fork, make the cherry-pick branch appear as non-existent, so that the
    // cherry-pick PR can be created properly without collisions.
    fork.expectBranchRequest(expectedCherryPickForkBranch);
  }
}

/**
 * Expects and fakes the necessary Github API requests for staging
 * and publishing of a given version.
 */
export async function expectGithubApiRequests(
  action: Omit<TestReleaseAction, 'gitClient'>,
  expectedBranch: string,
  expectedVersion: string,
  opts: {withCherryPicking: boolean; willShowAsLatestOnGitHub: boolean},
) {
  const {repo} = action;
  const expectedTagName = expectedVersion;

  // Setup staging mock requests.
  await expectGithubApiRequestsForStaging(action, expectedBranch, expectedVersion, opts);

  repo
    .expectBranchRequest(expectedBranch, {
      sha: 'STAGING_COMMIT_SHA',
      parents: [{sha: 'PRE_STAGING_SHA'}],
      commit: {message: `release: cut the v${expectedVersion} release\n\nPR Close #200.`},
    })
    .expectTagToBeCreated(expectedTagName, 'STAGING_COMMIT_SHA')
    .expectReleaseToBeCreated(expectedVersion, expectedTagName, opts.willShowAsLatestOnGitHub);
}

function expectNpmPublishToBeInvoked(packages: NpmPackage[], expectedNpmDistTag: NpmDistTag) {
  expect(NpmCommand.publish).toHaveBeenCalledTimes(packages.length);

  for (const pkg of packages) {
    expect(NpmCommand.publish).toHaveBeenCalledWith(
      `${testTmpDir}/dist/${pkg.name}`,
      expectedNpmDistTag,
      undefined,
    );
  }
}

export async function expectStagingAndPublishWithoutCherryPick(
  action: TestActionWithMockGitClient,
  expectedBranch: string,
  expectedVersion: string,
  expectedNpmDistTag: NpmDistTag,
  opts: {willShowAsLatestOnGitHub: boolean},
) {
  const {repo, fork, gitClient} = action;
  const expectedStagingForkBranch = `release-stage-${expectedVersion}`;

  await expectGithubApiRequests(action, expectedBranch, expectedVersion, {
    withCherryPicking: false,
    willShowAsLatestOnGitHub: opts.willShowAsLatestOnGitHub,
  });
  await action.instance.perform();

  expect(gitClient.pushed.length).toBe(1);
  expect(gitClient.pushed[0]).toEqual(
    getBranchPushMatcher({
      baseBranch: expectedBranch,
      baseRepo: repo,
      targetBranch: expectedStagingForkBranch,
      targetRepo: fork,
      expectedCommits: [
        {
          message: `release: cut the v${expectedVersion} release`,
          files: ['package.json', 'CHANGELOG.md'],
        },
      ],
    }),
    'Expected release staging branch to be created in fork.',
  );

  expect(ExternalCommands.invokeReleasePrecheck).toHaveBeenCalledTimes(1);
  expect(ExternalCommands.invokeReleaseBuild).toHaveBeenCalledTimes(1);
  expectNpmPublishToBeInvoked(testReleasePackages, expectedNpmDistTag);
}

export async function expectStagingAndPublishWithCherryPick(
  action: TestActionWithMockGitClient,
  expectedBranch: string,
  expectedVersion: string,
  expectedNpmDistTag: NpmDistTag,
  opts: {willShowAsLatestOnGitHub: boolean},
) {
  const {repo, fork, gitClient} = action;
  const expectedStagingForkBranch = `release-stage-${expectedVersion}`;
  const expectedCherryPickForkBranch = `changelog-cherry-pick-${expectedVersion}`;

  await expectGithubApiRequests(action, expectedBranch, expectedVersion, {
    withCherryPicking: true,
    willShowAsLatestOnGitHub: opts.willShowAsLatestOnGitHub,
  });
  await action.instance.perform();

  expect(gitClient.pushed.length).toBe(2);
  expect(gitClient.pushed[0]).toEqual(
    getBranchPushMatcher({
      baseBranch: expectedBranch,
      baseRepo: repo,
      targetBranch: expectedStagingForkBranch,
      targetRepo: fork,
      expectedCommits: [
        {
          message: `release: cut the v${expectedVersion} release`,
          files: ['package.json', 'CHANGELOG.md'],
        },
      ],
    }),
    'Expected release staging branch to be created in fork.',
  );

  expect(gitClient.pushed[1]).toEqual(
    getBranchPushMatcher({
      baseBranch: 'master',
      baseRepo: repo,
      targetBranch: expectedCherryPickForkBranch,
      targetRepo: fork,
      expectedCommits: [
        {
          message: `docs: release notes for the v${expectedVersion} release`,
          files: ['CHANGELOG.md'],
        },
      ],
    }),
    'Expected cherry-pick branch to be created in fork.',
  );

  expect(ExternalCommands.invokeReleasePrecheck).toHaveBeenCalledTimes(1);
  expect(ExternalCommands.invokeReleaseBuild).toHaveBeenCalledTimes(1);
  expectNpmPublishToBeInvoked(testReleasePackages, expectedNpmDistTag);
}
