/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Log} from '../../../utils/logging';
import {ActiveReleaseTrains, ReleaseTrain} from '../../versioning';
import {DelegateTestAction} from './delegate-test-action';
import {expectGithubApiRequestsForStaging} from './test-utils/staging-test';
import {parse, setupReleaseActionForTesting, writePackageJson} from './test-utils/test-utils';

describe('package output checks', () => {
  const baseReleaseTrains = new ActiveReleaseTrains({
    releaseCandidate: null,
    latest: new ReleaseTrain('13.0.x', parse('13.0.1')),
    next: new ReleaseTrain('main', parse('13.1.0-next.2')),
  });

  it('should not error if correct versions are set within `package.json` files', async () => {
    const action = setupReleaseActionForTesting(
      DelegateTestAction,
      baseReleaseTrains,
      /* isNextPublishedToNpm */ true,
      {stubBuiltPackageOutputChecks: false},
    );
    const {version, branchName} = baseReleaseTrains.latest;
    const versionName = version.format();

    await expectGithubApiRequestsForStaging(action, branchName, versionName, false);

    spyOn(Log, 'error');

    // Write the fake built package output `package.json` files.
    await writePackageJson('@angular/pkg1', '13.0.1');
    await writePackageJson('@angular/pkg2', '13.0.1');
    await writePackageJson('@experimental/somepkg', '0.1300.1');

    await expectAsync(
      action.instance.testStagingWithBuild(version, branchName, parse('0.0.0-compare-base')),
    ).not.toBeRejected();
    expect(Log.error).toHaveBeenCalledTimes(0);
  });

  describe('non-experimental packages', () => {
    it('should error if wrong versions are set within `package.json` files', async () => {
      const action = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
        /* isNextPublishedToNpm */ true,
        {stubBuiltPackageOutputChecks: false},
      );
      const {version, branchName} = baseReleaseTrains.latest;
      const versionName = version.format();

      await expectGithubApiRequestsForStaging(action, branchName, versionName, false);

      spyOn(Log, 'error');

      // Write the fake built package output `package.json` files.
      await writePackageJson('@angular/pkg1', '13.0.2');
      await writePackageJson('@angular/pkg2', '13.0.2');
      await writePackageJson('@experimental/somepkg', '0.1300.2');

      await expectAsync(
        action.instance.testStagingWithBuild(version, branchName, parse('0.0.0-compare-base')),
      ).toBeRejected();

      expect(Log.error).toHaveBeenCalledWith(
        jasmine.stringMatching(/The built package version does not match/),
      );
      expect(Log.error).toHaveBeenCalledWith(jasmine.stringMatching(/Expected version: 13\.0\.1/));
    });
  });

  describe('experimental packages', () => {
    it('should error if wrong versions are set within `package.json` files', async () => {
      const action = setupReleaseActionForTesting(
        DelegateTestAction,
        baseReleaseTrains,
        /* isNextPublishedToNpm */ true,
        {stubBuiltPackageOutputChecks: false},
      );
      const {version, branchName} = baseReleaseTrains.latest;
      const versionName = version.format();

      await expectGithubApiRequestsForStaging(action, branchName, versionName, false);

      spyOn(Log, 'error');

      // Write the fake built package output `package.json` files.
      await writePackageJson('@angular/pkg1', '13.0.1');
      await writePackageJson('@angular/pkg2', '13.0.1');
      await writePackageJson('@experimental/somepkg', '13.0.2');

      await expectAsync(
        action.instance.testStagingWithBuild(version, branchName, parse('0.0.0-compare-base')),
      ).toBeRejected();

      expect(Log.error).toHaveBeenCalledWith(
        jasmine.stringMatching(/The built package version does not match/),
      );
      expect(Log.error).toHaveBeenCalledWith(
        jasmine.stringMatching(/Expected version: 0\.1300\.1/),
      );
    });
  });
});
