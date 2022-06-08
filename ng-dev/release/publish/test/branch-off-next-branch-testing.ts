/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';

import {getBranchPushMatcher, testTmpDir} from '../../../utils/testing/index.js';
import {ActiveReleaseTrains} from '../../versioning/index.js';
import {NpmCommand} from '../../versioning/npm-command.js';
import {ReleaseActionConstructor} from '../actions.js';
import {BranchOffNextBranchBaseAction} from '../actions/branch-off-next-branch.js';
import {ExternalCommands} from '../external-commands.js';
import {testReleasePackages} from './test-utils/action-mocks.js';
import {TestReleaseAction} from './test-utils/test-action.js';
import {setupReleaseActionForTesting} from './test-utils/test-utils.js';

/**
 * Expects and fakes the necessary Github API requests for branching-off
 * the next branch to a specified new version.
 */
async function expectGithubApiRequestsForBranchOff(
  action: Omit<TestReleaseAction, 'gitClient'>,
  expectedNextVersion: string,
  expectedVersion: string,
  expectedNewBranch: string,
) {
  const {repo, fork} = action;
  const expectedNextUpdateBranch = `next-release-train-${expectedNextVersion}`;
  const expectedStagingForkBranch = `release-stage-${expectedVersion}`;
  const expectedTagName = expectedVersion;

  // We first mock the commit status check for the next branch, then expect two pull
  // requests from a fork that are targeting next and the new feature-freeze branch.
  repo
    .expectBranchRequest('master', 'PRE_STAGING_SHA')
    .expectCommitStatusCheck('PRE_STAGING_SHA', 'success')
    .expectFindForkRequest(fork)
    .expectPullRequestToBeCreated(expectedNewBranch, fork, expectedStagingForkBranch, 200)
    .expectPullRequestWait(200)
    .expectBranchRequest(expectedNewBranch, 'STAGING_COMMIT_SHA')
    .expectCommitRequest(
      'STAGING_COMMIT_SHA',
      `release: cut the v${expectedVersion} release\n\nPR Close #200.`,
    )
    .expectCommitCompareRequest('PRE_STAGING_SHA', 'STAGING_COMMIT_SHA', {
      status: 'ahead',
      ahead_by: 1,
    })
    .expectTagToBeCreated(expectedTagName, 'STAGING_COMMIT_SHA')
    .expectReleaseToBeCreated(`v${expectedVersion}`, expectedTagName)
    .expectPullRequestToBeCreated('master', fork, expectedNextUpdateBranch, 100);

  // In the fork, we make the following branches appear as non-existent,
  // so that the PRs can be created properly without collisions.
  fork
    .expectBranchRequest(expectedStagingForkBranch, null)
    .expectBranchRequest(expectedNextUpdateBranch, null);

  return {expectedNextUpdateBranch, expectedStagingForkBranch, expectedTagName};
}

/**
 * Performs the given branch-off release action and expects versions and
 * branches to be determined and created properly.
 */
export async function expectBranchOffActionToRun(
  actionType: ReleaseActionConstructor<BranchOffNextBranchBaseAction>,
  active: ActiveReleaseTrains,
  isNextPublishedToNpm: boolean,
  expectedNextVersion: string,
  expectedVersion: string,
  expectedNewBranch: string,
) {
  const action = setupReleaseActionForTesting(actionType, active, isNextPublishedToNpm);
  const {repo, fork, instance, gitClient} = action;

  const {expectedStagingForkBranch, expectedNextUpdateBranch} =
    await expectGithubApiRequestsForBranchOff(
      action,
      expectedNextVersion,
      expectedVersion,
      expectedNewBranch,
    );

  await instance.perform();

  expect(gitClient.pushed.length).toBe(3);
  expect(gitClient.pushed[0]).toEqual(
    getBranchPushMatcher({
      baseRepo: repo,
      baseBranch: 'master',
      targetRepo: repo,
      targetBranch: expectedNewBranch,
      expectedCommits: [],
    }),
    'Expected new version-branch to be created upstream and based on "master".',
  );
  expect(gitClient.pushed[1]).toEqual(
    getBranchPushMatcher({
      baseBranch: 'master',
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

  expect(gitClient.pushed[2]).toEqual(
    getBranchPushMatcher({
      baseBranch: 'master',
      baseRepo: repo,
      targetBranch: expectedNextUpdateBranch,
      targetRepo: fork,
      expectedCommits: [
        {
          message: `release: bump the next branch to v${expectedNextVersion}`,
          files: ['package.json'],
        },
        {
          message: `docs: release notes for the v${expectedVersion} release`,
          files: ['CHANGELOG.md'],
        },
      ],
    }),
    'Expected next release-train update branch be created in fork.',
  );

  expect(ExternalCommands.invokeReleasePrecheck).toHaveBeenCalledTimes(1);
  expect(ExternalCommands.invokeReleaseBuild).toHaveBeenCalledTimes(1);
  expect(NpmCommand.publish).toHaveBeenCalledTimes(testReleasePackages.length);

  for (const pkg of testReleasePackages) {
    expect(NpmCommand.publish).toHaveBeenCalledWith(
      `${testTmpDir}/dist/${pkg.name}`,
      'next',
      undefined,
    );
  }
}

/**
 * Prepares the specified release action for a test run where the changelog is being
 * generated. The action is not run automatically because the test author should still
 * be able to operate within the sandbox git repo.
 *
 * A function is exposed that can be invoked to build the changelog.
 */
export function prepareBranchOffActionForChangelog(
  actionType: ReleaseActionConstructor<BranchOffNextBranchBaseAction>,
  active: ActiveReleaseTrains,
  isNextPublishedToNpm: boolean,
  expectedNextVersion: string,
  expectedVersion: string,
  expectedNewBranch: string,
) {
  const action = setupReleaseActionForTesting(actionType, active, isNextPublishedToNpm, {
    useSandboxGitClient: true,
  });

  const buildChangelog = async () => {
    await expectGithubApiRequestsForBranchOff(
      action,
      expectedNextVersion,
      expectedVersion,
      expectedNewBranch,
    );
    await action.instance.perform();

    return readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');
  };

  return {action, buildChangelog};
}
