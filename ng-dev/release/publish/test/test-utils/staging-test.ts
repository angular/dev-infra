/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getBranchPushMatcher, testTmpDir} from '../../../../utils/testing';
import {NpmPackage} from '../../../config';
import {NpmDistTag} from '../../../versioning';
import {NpmCommand} from '../../../versioning/npm-command';
import {ExternalCommands} from '../../external-commands';
import {testReleasePackages} from './action-mocks';
import {TestReleaseAction} from './test-action';

/**
 * Expects and fakes the necessary Github API requests for staging
 * a given version.
 */
export async function expectGithubApiRequestsForStaging(
  action: Omit<TestReleaseAction, 'gitClient'>,
  expectedBranch: string,
  expectedVersion: string,
  withCherryPicking: boolean,
) {
  const {repo, fork} = action;
  const expectedStagingForkBranch = `release-stage-${expectedVersion}`;
  const expectedTagName = expectedVersion;

  // We first mock the commit status check for the next branch, then expect two pull
  // requests from a fork that are targeting next and the new feature-freeze branch.
  repo
    .expectBranchRequest(expectedBranch, 'PRE_STAGING_SHA')
    .expectCommitStatusCheck('PRE_STAGING_SHA', 'success')
    .expectFindForkRequest(fork)
    .expectPullRequestToBeCreated(expectedBranch, fork, expectedStagingForkBranch, 200)
    .expectPullRequestWait(200)
    .expectBranchRequest(expectedBranch, 'STAGING_COMMIT_SHA')
    .expectCommitRequest(
      'STAGING_COMMIT_SHA',
      `release: cut the v${expectedVersion} release\n\nPR Close #200.`,
    )
    .expectCommitCompareRequest('PRE_STAGING_SHA', 'STAGING_COMMIT_SHA', {
      status: 'ahead',
      ahead_by: 1,
    })
    .expectTagToBeCreated(expectedTagName, 'STAGING_COMMIT_SHA')
    .expectReleaseToBeCreated(`v${expectedVersion}`, expectedTagName);

  // In the fork, we make the staging branch appear as non-existent,
  // so that the PR can be created properly without collisions.
  fork.expectBranchRequest(expectedStagingForkBranch, null);

  if (withCherryPicking) {
    const expectedCherryPickForkBranch = `changelog-cherry-pick-${expectedVersion}`;

    repo
      .expectPullRequestToBeCreated('master', fork, expectedCherryPickForkBranch, 300)
      .expectPullRequestWait(300);

    // In the fork, make the cherry-pick branch appear as non-existent, so that the
    // cherry-pick PR can be created properly without collisions.
    fork
      .expectBranchRequest(expectedStagingForkBranch, null)
      .expectBranchRequest(expectedCherryPickForkBranch, null);
  }
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
  action: TestReleaseAction,
  expectedBranch: string,
  expectedVersion: string,
  expectedNpmDistTag: NpmDistTag,
  options: {expectNoExperimentalPackages?: boolean} = {},
) {
  const {repo, fork, gitClient} = action;
  const expectedStagingForkBranch = `release-stage-${expectedVersion}`;

  await expectGithubApiRequestsForStaging(action, expectedBranch, expectedVersion, false);
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

  const publishedPackages = options.expectNoExperimentalPackages
    ? testReleasePackages.filter((pkg) => !pkg.experimental)
    : testReleasePackages;

  expect(ExternalCommands.invokeReleasePrecheck).toHaveBeenCalledTimes(1);
  expect(ExternalCommands.invokeReleaseBuild).toHaveBeenCalledTimes(1);
  expectNpmPublishToBeInvoked(publishedPackages, expectedNpmDistTag);
}

export async function expectStagingAndPublishWithCherryPick(
  action: TestReleaseAction,
  expectedBranch: string,
  expectedVersion: string,
  expectedNpmDistTag: NpmDistTag,
  options: {expectNoExperimentalPackages?: boolean} = {},
) {
  const {repo, fork, gitClient} = action;
  const expectedStagingForkBranch = `release-stage-${expectedVersion}`;
  const expectedCherryPickForkBranch = `changelog-cherry-pick-${expectedVersion}`;

  await expectGithubApiRequestsForStaging(action, expectedBranch, expectedVersion, true);
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

  const publishedPackages = options.expectNoExperimentalPackages
    ? testReleasePackages.filter((pkg) => !pkg.experimental)
    : testReleasePackages;

  expect(ExternalCommands.invokeReleasePrecheck).toHaveBeenCalledTimes(1);
  expect(ExternalCommands.invokeReleaseBuild).toHaveBeenCalledTimes(1);
  expectNpmPublishToBeInvoked(publishedPackages, expectedNpmDistTag);
}
