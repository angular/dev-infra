/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as fs from 'fs';
import {ActiveReleaseTrains, ReleaseTrain} from '../../versioning';
import {testTmpDir} from '../../../utils/testing';

import {parse, setupReleaseActionForTesting} from './test-utils/test-utils';
import {DelegateTestAction} from './delegate-test-action';
import * as console from '../../../utils/console';

describe('package output checks', () => {
  const baseReleaseTrains = new ActiveReleaseTrains({
    releaseCandidate: null,
    latest: new ReleaseTrain('13.0.x', parse('13.0.1')),
    next: new ReleaseTrain('main', parse('13.1.0-next.2')),
  });

  /** Writes a `package.json` for the given package output. */
  async function writePackageJson(packageName: string, version: string) {
    const packageOutDir = path.join(testTmpDir, 'dist', packageName);
    const packageJsonPath = path.join(packageOutDir, 'package.json');

    await fs.promises.mkdir(packageOutDir, {recursive: true});
    await fs.promises.writeFile(packageJsonPath, JSON.stringify({version}));
  }

  it('should not error if correct versions are set within `package.json` files', async () => {
    const {repo, instance} = setupReleaseActionForTesting(
      DelegateTestAction,
      baseReleaseTrains,
      /* isNextPublishedToNpm */ true,
      {stubBuiltPackageOutputChecks: false},
    );
    const {version, branchName} = baseReleaseTrains.latest;
    const tagName = version.format();

    repo
      .expectBranchRequest(branchName, 'STAGING_SHA')
      .expectCommitRequest('STAGING_SHA', `release: cut the v${version} release`)
      .expectTagToBeCreated(tagName, 'STAGING_SHA')
      .expectReleaseToBeCreated(`v${version}`, tagName);

    spyOn(console, 'error');

    // Write the fake built package output `package.json` files.
    await writePackageJson('@angular/pkg1', '13.0.1');
    await writePackageJson('@angular/pkg2', '13.0.1');
    await writePackageJson('@experimental/somepkg', '0.1300.1');

    await expectAsync(
      instance.testBuildAndPublish(version, branchName, 'latest'),
    ).not.toBeRejected();
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  describe('non-experimental packages', () => {
    it('should error if wrong versions are set within `package.json` files', async () => {
      const {repo, instance} = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
        /* isNextPublishedToNpm */ true,
        {stubBuiltPackageOutputChecks: false},
      );
      const {version, branchName} = baseReleaseTrains.latest;
      const tagName = version.format();

      repo
        .expectBranchRequest(branchName, 'STAGING_SHA')
        .expectCommitRequest('STAGING_SHA', `release: cut the v${version} release`)
        .expectTagToBeCreated(tagName, 'STAGING_SHA')
        .expectReleaseToBeCreated(`v${version}`, tagName);

      spyOn(console, 'error');

      // Write the fake built package output `package.json` files.
      await writePackageJson('@angular/pkg1', '13.0.2');
      await writePackageJson('@angular/pkg2', '13.0.2');

      await expectAsync(instance.testBuildAndPublish(version, branchName, 'latest')).toBeRejected();

      expect(console.error).toHaveBeenCalledWith(
        jasmine.stringMatching(/The built package version does not match/),
      );
      expect(console.error).toHaveBeenCalledWith(
        jasmine.stringMatching(/Expected version: 13\.0\.1/),
      );
    });
  });

  describe('experimental packages', () => {
    it('should error if wrong versions are set within `package.json` files', async () => {
      const {repo, instance} = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
        /* isNextPublishedToNpm */ true,
        {stubBuiltPackageOutputChecks: false},
      );
      const {version, branchName} = baseReleaseTrains.latest;
      const tagName = version.format();

      repo
        .expectBranchRequest(branchName, 'STAGING_SHA')
        .expectCommitRequest('STAGING_SHA', `release: cut the v${version} release`)
        .expectTagToBeCreated(tagName, 'STAGING_SHA')
        .expectReleaseToBeCreated(`v${version}`, tagName);

      spyOn(console, 'error');

      // Write the fake built package output `package.json` files.
      await writePackageJson('@angular/pkg1', '13.0.1');
      await writePackageJson('@angular/pkg2', '13.0.1');
      await writePackageJson('@experimental/somepkg', '13.0.2');

      await expectAsync(instance.testBuildAndPublish(version, branchName, 'latest')).toBeRejected();

      expect(console.error).toHaveBeenCalledWith(
        jasmine.stringMatching(/The built package version does not match/),
      );
      expect(console.error).toHaveBeenCalledWith(
        jasmine.stringMatching(/Expected version: 0\.1300\.1/),
      );
    });
  });
});
