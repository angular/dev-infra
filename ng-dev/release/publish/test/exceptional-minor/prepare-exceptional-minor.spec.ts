/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {workspaceRelativePackageJsonPath} from '../../../../utils/constants.js';
import {getBranchPushMatcher} from '../../../../utils/testing/index.js';
import {
  ActiveReleaseTrains,
  exceptionalMinorPackageIndicator,
  PackageJson,
} from '../../../versioning/index.js';
import {NpmCommand} from '../../../versioning/npm-command.js';
import {ReleaseTrain} from '../../../versioning/release-trains.js';
import {PrepareExceptionalMinorAction} from '../../actions/exceptional-minor/prepare-exceptional-minor.js';
import {parse, setupReleaseActionForTesting} from '../test-utils/test-utils.js';

describe('cut exceptional minor next release candidate action', () => {
  it('should activate if a major is in the FF/RC train', async () => {
    expect(
      await PrepareExceptionalMinorAction.isActive(
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('14.2.x', parse('14.2.0')),
          exceptionalMinor: null,
          releaseCandidate: new ReleaseTrain('15.0.x', parse('15.0.0-next.0')),
          next: new ReleaseTrain('main', parse('15.2.0-next.0')),
        }),
      ),
    ).toBe(true);
  });

  it('should activate if a major is in the `next` train and there is no FF/RC train', async () => {
    expect(
      await PrepareExceptionalMinorAction.isActive(
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('14.2.x', parse('14.2.0')),
          exceptionalMinor: null,
          releaseCandidate: null,
          next: new ReleaseTrain('main', parse('15.0.0-next.0')),
        }),
      ),
    ).toBe(true);
  });

  it('should not activate if a minor is in the FF/RC train', async () => {
    expect(
      await PrepareExceptionalMinorAction.isActive(
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('14.2.x', parse('14.2.0')),
          exceptionalMinor: null,
          releaseCandidate: new ReleaseTrain('14.3.x', parse('14.3.0-next.0')),
          next: new ReleaseTrain('main', parse('15.0.0-next.0')),
        }),
      ),
    ).toBe(false);
  });

  it('should not activate if a minor is in the next train and there is no FF/RC train', async () => {
    expect(
      await PrepareExceptionalMinorAction.isActive(
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('14.2.x', parse('14.2.0')),
          exceptionalMinor: null,
          releaseCandidate: null,
          next: new ReleaseTrain('main', parse('14.3.0-next.0')),
        }),
      ),
    ).toBe(false);
  });

  describe('with a major in the next', () => {
    it('should create a new branch based on the current "latest" train', async () => {
      const {instance, repo, gitClient} = setupReleaseActionForTesting(
        PrepareExceptionalMinorAction,
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('14.2.x', parse('14.2.0')),
          exceptionalMinor: null,
          releaseCandidate: null,
          next: new ReleaseTrain('main', parse('15.0.0-next.0')),
        }),
      );

      repo
        .expectBranchRequest('14.2.x', {sha: 'PATCH_LATEST_SHA'})
        .expectCommitStatusCheck('PATCH_LATEST_SHA', 'success');

      await instance.perform();

      expect(gitClient.pushed).toEqual([
        getBranchPushMatcher({
          targetBranch: '14.3.x',
          targetRepo: repo,
          baseBranch: '14.2.x',
          baseRepo: repo,
          expectedCommits: [
            {
              message: `build: prepare exceptional minor branch: 14.3.x`,
              files: ['package.json'],
            },
          ],
        }),
      ]);
    });

    it('should update the new branch `package.json` to an unpublished next version', async () => {
      const {instance, repo, projectDir} = setupReleaseActionForTesting(
        PrepareExceptionalMinorAction,
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('14.2.x', parse('14.2.0')),
          exceptionalMinor: null,
          releaseCandidate: null,
          next: new ReleaseTrain('main', parse('15.0.0-next.0')),
        }),
      );

      repo
        .expectBranchRequest('14.2.x', {sha: 'PATCH_LATEST_SHA'})
        .expectCommitStatusCheck('PATCH_LATEST_SHA', 'success');

      await instance.perform();

      const finalPkgJsonRaw = await fs.promises.readFile(
        path.join(projectDir, workspaceRelativePackageJsonPath),
        'utf8',
      );
      const pkgJson = JSON.parse(finalPkgJsonRaw) as {
        version?: string;
        [exceptionalMinorPackageIndicator]?: boolean;
      };

      expect(NpmCommand.publish).toHaveBeenCalledTimes(0);
      expect(pkgJson.version).toBe('14.3.0-next.0');
      expect(pkgJson[exceptionalMinorPackageIndicator]).toBe(true);
    });
  });

  describe('with a major in the FF/RC train', () => {
    it('should create a new branch based on the current "latest" train', async () => {
      const {instance, repo, gitClient} = setupReleaseActionForTesting(
        PrepareExceptionalMinorAction,
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('14.2.x', parse('14.2.0')),
          exceptionalMinor: null,
          releaseCandidate: new ReleaseTrain('15.0.x', parse('15.0.0-rc.3')),
          next: new ReleaseTrain('main', parse('15.1.0-next.0')),
        }),
      );

      repo
        .expectBranchRequest('14.2.x', {sha: 'PATCH_LATEST_SHA'})
        .expectCommitStatusCheck('PATCH_LATEST_SHA', 'success');

      await instance.perform();

      expect(gitClient.pushed).toEqual([
        getBranchPushMatcher({
          targetBranch: '14.3.x',
          targetRepo: repo,
          baseBranch: '14.2.x',
          baseRepo: repo,
          expectedCommits: [
            {
              message: `build: prepare exceptional minor branch: 14.3.x`,
              files: ['package.json'],
            },
          ],
        }),
      ]);
    });

    it('should update the new branch `package.json` to an unpublished next version', async () => {
      const {instance, repo, projectDir} = setupReleaseActionForTesting(
        PrepareExceptionalMinorAction,
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('14.2.x', parse('14.2.0')),
          exceptionalMinor: null,
          releaseCandidate: new ReleaseTrain('15.0.x', parse('15.0.0-rc.3')),
          next: new ReleaseTrain('main', parse('15.1.0-next.0')),
        }),
      );

      repo
        .expectBranchRequest('14.2.x', {sha: 'PATCH_LATEST_SHA'})
        .expectCommitStatusCheck('PATCH_LATEST_SHA', 'success');

      await instance.perform();

      const finalPkgJsonRaw = await fs.promises.readFile(
        path.join(projectDir, workspaceRelativePackageJsonPath),
        'utf8',
      );
      const pkgJson = JSON.parse(finalPkgJsonRaw) as PackageJson;

      expect(NpmCommand.publish).toHaveBeenCalledTimes(0);
      expect(pkgJson.version).toBe('14.3.0-next.0');
      expect(pkgJson[exceptionalMinorPackageIndicator]).toBe(true);
    });
  });
});
