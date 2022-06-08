/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {matchesVersion} from '../../../utils/testing/index.js';
import {ActiveReleaseTrains} from '../../versioning/index.js';
import {ReleaseTrain} from '../../versioning/release-trains.js';
import {TagRecentMajorAsLatest} from '../actions/tag-recent-major-as-latest.js';
import {ExternalCommands} from '../external-commands.js';
import {getTestConfigurationsForAction} from './test-utils/action-mocks.js';
import {
  fakeNpmPackageQueryRequest,
  parse,
  setupReleaseActionForTesting,
} from './test-utils/test-utils.js';

describe('tag recent major as latest action', () => {
  it('should not be active if a patch has been published after major release', async () => {
    const {releaseConfig} = getTestConfigurationsForAction();
    expect(
      await TagRecentMajorAsLatest.isActive(
        new ActiveReleaseTrains({
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.1.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.1')),
        }),
        releaseConfig,
      ),
    ).toBe(false);
  });

  it(
    'should not be active if a major has been released recently but "@latest" on NPM points to ' +
      'a more recent major',
    async () => {
      const {releaseConfig} = getTestConfigurationsForAction();

      // NPM `@latest` will point to a patch release of a more recent major. This is unlikely
      // to happen (only with manual changes outside of the release tool), but should
      // prevent accidental overrides from the release action.
      fakeNpmPackageQueryRequest(releaseConfig.representativeNpmPackage, {
        'dist-tags': {'latest': '11.0.3'},
      });

      expect(
        await TagRecentMajorAsLatest.isActive(
          new ActiveReleaseTrains({
            releaseCandidate: null,
            next: new ReleaseTrain('master', parse('10.1.0-next.0')),
            latest: new ReleaseTrain('10.0.x', parse('10.0.0')),
          }),
          releaseConfig,
        ),
      ).toBe(false);
    },
  );

  it(
    'should not be active if a major has been released recently but "@latest" on NPM points to ' +
      'an older major',
    async () => {
      const {releaseConfig} = getTestConfigurationsForAction();

      // NPM `@latest` will point to a patch release of an older major. This is unlikely to happen
      // (only with manual changes outside of the release tool), but should prevent accidental
      // changes from the release action that indicate mismatched version branches, or an
      // out-of-sync NPM registry.
      fakeNpmPackageQueryRequest(releaseConfig.representativeNpmPackage, {
        'dist-tags': {'latest': '8.4.7'},
      });

      expect(
        await TagRecentMajorAsLatest.isActive(
          new ActiveReleaseTrains({
            releaseCandidate: null,
            next: new ReleaseTrain('master', parse('10.1.0-next.0')),
            latest: new ReleaseTrain('10.0.x', parse('10.0.0')),
          }),
          releaseConfig,
        ),
      ).toBe(false);
    },
  );

  it(
    'should be active if a major has been released recently but is not published as ' +
      '"@latest" to NPM',
    async () => {
      const {releaseConfig} = getTestConfigurationsForAction();

      // NPM `@latest` will point to a patch release of the previous major.
      fakeNpmPackageQueryRequest(releaseConfig.representativeNpmPackage, {
        'dist-tags': {'latest': '9.2.3'},
      });

      expect(
        await TagRecentMajorAsLatest.isActive(
          new ActiveReleaseTrains({
            releaseCandidate: null,
            next: new ReleaseTrain('master', parse('10.1.0-next.0')),
            latest: new ReleaseTrain('10.0.x', parse('10.0.0')),
          }),
          releaseConfig,
        ),
      ).toBe(true);
    },
  );

  it('should re-tag the version in the NPM registry and update the Github release', async () => {
    const {instance, gitClient, projectDir, releaseConfig, repo} = setupReleaseActionForTesting(
      TagRecentMajorAsLatest,
      new ActiveReleaseTrains({
        releaseCandidate: null,
        next: new ReleaseTrain('master', parse('10.1.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.0')),
      }),
    );

    // NPM `@latest` will point to a patch release of the previous major.
    fakeNpmPackageQueryRequest(releaseConfig.representativeNpmPackage, {
      'dist-tags': {'latest': '9.2.3'},
    });

    repo
      .expectReleaseByTagRequest('10.0.0', /* fakeReleaseId */ 1)
      .expectReleaseUpdateRequest(1, {prerelease: false});

    await instance.perform();

    // Ensure that the NPM dist tag is set only for packages that were available in the previous
    // major version. A spy has already been installed on the function.
    (ExternalCommands.invokeSetNpmDist as jasmine.Spy).and.callFake(() => {
      expect(gitClient.head.ref?.name).toBe('10.0.x');
      return Promise.resolve();
    });

    expect(ExternalCommands.invokeSetNpmDist).toHaveBeenCalledTimes(1);
    expect(ExternalCommands.invokeSetNpmDist).toHaveBeenCalledWith(
      projectDir,
      'latest',
      matchesVersion('10.0.0'),
    );
  });
});
