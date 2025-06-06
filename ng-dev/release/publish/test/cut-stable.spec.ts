/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {matchesVersion} from '../../../utils/testing/index.js';
import {ReleaseTrain} from '../../versioning/release-trains.js';
import {CutStableAction} from '../actions/cut-stable.js';
import {ExternalCommands} from '../external-commands.js';

import path from 'path';
import fs from 'fs';
import {changelogPattern, parse, setupReleaseActionForTesting} from './test-utils/test-utils.js';
import {
  expectGithubApiRequests,
  expectStagingAndPublishWithCherryPick,
} from './test-utils/staging-test.js';
import {testTmpDir, SandboxGitRepo} from '../../../utils/testing/index.js';
import {
  ActiveReleaseTrains,
  exceptionalMinorPackageIndicator,
  PackageJson,
} from '../../versioning/index.js';
import {ReleaseNotes} from '../../notes/release-notes.js';
import {workspaceRelativePackageJsonPath} from '../../../utils/constants.js';
import {PnpmVersioning} from '../pnpm-versioning.js';

describe('cut stable action', () => {
  it('should not activate if a feature-freeze release-train is active', async () => {
    expect(
      await CutStableAction.isActive(
        new ActiveReleaseTrains({
          exceptionalMinor: null,
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.1')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(false);
  });

  it(
    'should activate if a feature-freeze release-train is active ' +
      'but there is an exceptional minor in RC-phase',
    async () => {
      expect(
        await CutStableAction.isActive(
          new ActiveReleaseTrains({
            latest: new ReleaseTrain('14.4.x', parse('14.4.3')),
            exceptionalMinor: new ReleaseTrain('14.5.x', parse('14.5.0-rc.10')),
            releaseCandidate: new ReleaseTrain('15.0.x', parse('15.0.0-next.2')),
            next: new ReleaseTrain('master', parse('15.1.0-next.0')),
          }),
        ),
      ).toBe(true);
    },
  );

  it('should activate if release-candidate release-train is active', async () => {
    expect(
      await CutStableAction.isActive(
        new ActiveReleaseTrains({
          exceptionalMinor: null,
          // No longer in feature-freeze but in release-candidate phase.
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(true);
  });

  it('should not activate if no FF/RC release-train is active', async () => {
    expect(
      await CutStableAction.isActive(
        new ActiveReleaseTrains({
          exceptionalMinor: null,
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.1.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
      ),
    ).toBe(false);
  });

  it('should activate if there is no FF/RC train but there is an exceptional minor in RC-phase', async () => {
    expect(
      await CutStableAction.isActive(
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('14.4.x', parse('14.4.3')),
          exceptionalMinor: new ReleaseTrain('14.5.x', parse('14.5.0-rc.10')),
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('15.0.0-next.0')),
        }),
      ),
    ).toBe(true);
  });

  it('should create a proper new version and select correct branch', async () => {
    const action = setupReleaseActionForTesting(
      CutStableAction,
      new ActiveReleaseTrains({
        exceptionalMinor: null,
        // No longer in feature-freeze but in release-candidate phase.
        releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
      }),
    );

    await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0', 'latest', {
      willShowAsLatestOnGitHub: true,
    });
  });

  it('should not tag the previous latest release-train if a minor has been cut', async () => {
    const action = setupReleaseActionForTesting(
      CutStableAction,
      new ActiveReleaseTrains({
        exceptionalMinor: null,
        // No longer in feature-freeze but in release-candidate phase.
        releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
      }),
    );

    await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0', 'latest', {
      willShowAsLatestOnGitHub: true,
    });
    expect(ExternalCommands.invokeSetNpmDist).toHaveBeenCalledTimes(0);
  });

  it('should tag the previous latest release-train if a major has been cut', async () => {
    const action = setupReleaseActionForTesting(
      CutStableAction,
      new ActiveReleaseTrains({
        exceptionalMinor: null,
        // No longer in feature-freeze but in release-candidate phase.
        releaseCandidate: new ReleaseTrain('11.0.x', parse('11.0.0-rc.0')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
      }),
    );

    // Ensure that the NPM dist tag is set only for packages that were available in the previous
    // major version. A spy has already been installed on the function.
    (ExternalCommands.invokeSetNpmDist as jasmine.Spy).and.callFake(() => {
      expect(action.gitClient.head.ref?.name).toBe('10.0.x');
      return Promise.resolve();
    });

    // Major is released to the `next` NPM dist tag initially. Can be re-tagged with
    // a separate release action. See `CutStableAction` for more details.
    await expectStagingAndPublishWithCherryPick(action, '11.0.x', '11.0.0', 'next', {
      willShowAsLatestOnGitHub: true,
    });
    expect(ExternalCommands.invokeSetNpmDist).toHaveBeenCalledTimes(1);
    expect(ExternalCommands.invokeSetNpmDist).toHaveBeenCalledWith(
      action.projectDir,
      'v10-lts',
      matchesVersion('10.0.3'),
      new PnpmVersioning(),
      // Experimental packages are expected to be not tagged as LTS.
      {skipExperimentalPackages: true},
    );
  });

  it(
    'should generate release notes capturing all associated RC, next releases while ' +
      'deduping commits that have been cherry-picked from the existing patch',
    async () => {
      const action = setupReleaseActionForTesting(
        CutStableAction,
        new ActiveReleaseTrains({
          exceptionalMinor: null,
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
        {useSandboxGitClient: true},
      );

      SandboxGitRepo.withInitialCommit(action.githubConfig)
        .commit('fix(pkg1): landed in all release trains *1')
        .branchOff('10.0.x')
        .commit('fix(pkg1): released in patch, cherry-picked *1', 1)
        .commit('fix(pkg1): released in patch, cherry-picked *2', 2)
        .createTagForHead('10.0.3')
        .commit('fix(pkg1): landed in patch, not released but cherry-picked *1', 3)
        .switchToBranch('master')
        .cherryPick(1)
        .cherryPick(2)
        // All commits below are new to this current RC release-train, and are expected
        // to be captured in the release notes. The cherry-picked commits from above have
        // already been released as part of `10.0.3` and should be omitted.
        .cherryPick(3)
        .commit('fix(pkg1): released first next pre-release *1')
        .commit('fix(pkg1): released first next pre-release *2')
        .createTagForHead('10.1.0-next.0')
        .commit('fix(pkg1): released feature-freeze pre-release *1')
        .commit('fix(pkg1): released feature-freeze pre-release *2')
        .branchOff('10.1.x')
        .createTagForHead('10.1.0-next.1')
        .commit('fix(pkg1): released release-candidate *1')
        .commit('fix(pkg1): released release-candidate *2')
        .createTagForHead('10.1.0-rc.0')
        .commit('fix(pkg1): not yet released *1')
        .commit('fix(pkg1): not yet released *2');

      await expectGithubApiRequests(action, '10.1.x', '10.1.0', {
        withCherryPicking: true,
        willShowAsLatestOnGitHub: true,
      });
      await action.instance.perform();

      const changelog = fs.readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

      expect(changelog).toMatch(changelogPattern`
      # 10.1.0 <..>
      ### pkg1
      | Commit | Type | Description |
      | -- | -- | -- |
      | <..> | fix | landed in patch, not released but cherry-picked *1 |
      | <..> | fix | not yet released *1 |
      | <..> | fix | not yet released *2 |
      | <..> | fix | released feature-freeze pre-release *1 |
      | <..> | fix | released feature-freeze pre-release *2 |
      | <..> | fix | released first next pre-release *1 |
      | <..> | fix | released first next pre-release *2 |
      | <..> | fix | released release-candidate *1 |
      | <..> | fix | released release-candidate *2 |
    `);
    },
  );

  it(
    'removes prerelease changelog entries for the new stable release when creating the stable ' +
      'release changelog entry',
    async () => {
      const action = setupReleaseActionForTesting(
        CutStableAction,
        new ActiveReleaseTrains({
          exceptionalMinor: null,
          releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
        }),
        {useSandboxGitClient: true},
      );

      SandboxGitRepo.withInitialCommit(action.githubConfig)
        .commit('fix(pkg1): landed in all release trains *1')
        .branchOff('10.0.x')
        .commit('fix(pkg1): released in patch, cherry-picked *1', 1)
        .commit('fix(pkg1): released in patch, cherry-picked *2', 2)
        .createTagForHead('10.0.3')
        .commit('fix(pkg1): landed in patch, not released but cherry-picked *1', 3)
        .switchToBranch('master')
        .cherryPick(1)
        .cherryPick(2)
        .cherryPick(3)
        .commit('fix(pkg1): released first next pre-release *1')
        .commit('fix(pkg1): released first next pre-release *2')
        .createTagForHead('10.1.0-next.0')
        .commit('fix(pkg1): released feature-freeze pre-release *1')
        .commit('fix(pkg1): released feature-freeze pre-release *2')
        .branchOff('10.1.x')
        .createTagForHead('10.1.0-next.1')
        .commit('fix(pkg1): released release-candidate *1')
        .commit('fix(pkg1): released release-candidate *2')
        .createTagForHead('10.1.0-rc.0')
        .commit('fix(pkg1): not yet released *1')
        .commit('fix(pkg1): not yet released *2');

      const entriesBeforeStableReleaseAction: [startingRef: string, endingRef: string][] = [
        ['10.0.3~2', '10.0.3'],
        ['10.0.3', '10.1.0-next.0'],
        ['10.1.0-next.0', '10.1.0-next.1'],
        ['10.1.0-next.1', '10.1.0-rc.0'],
      ];
      for (const [start, end] of entriesBeforeStableReleaseAction) {
        const releaseNotes = await ReleaseNotes.forRange(action.gitClient, parse(end), start, end);
        await releaseNotes.prependEntryToChangelogFile();
      }

      // Assert the existence of the expected versions in the changelog.
      const changelogBeforeAction = fs.readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');
      expect(changelogBeforeAction).toContain('<a name="10.0.3"></a>');
      expect(changelogBeforeAction).toContain('<a name="10.1.0-next.0"></a>');
      expect(changelogBeforeAction).toContain('<a name="10.1.0-next.1"></a>');
      expect(changelogBeforeAction).toContain('<a name="10.1.0-rc.0"></a>');
      expect(changelogBeforeAction).not.toContain('<a name="10.1.0"></a>');

      await expectGithubApiRequests(action, '10.1.x', '10.1.0', {
        willShowAsLatestOnGitHub: true,
        withCherryPicking: true,
      });
      await action.instance.perform();

      // Assert the removal of changelog entries for the prerelease versions expected to be removed
      // and now has the new stable entry.
      const changelogAfterAction = fs.readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');
      expect(changelogAfterAction).not.toContain('<a name="10.0.3"></a>');
      expect(changelogAfterAction).not.toContain('<a name="10.1.0-next.0"></a>');
      expect(changelogAfterAction).not.toContain('<a name="10.1.0-next.1"></a>');
      expect(changelogAfterAction).not.toContain('<a name="10.1.0-rc.0"></a>');
      expect(changelogAfterAction).toContain('<a name="10.1.0"></a>');
    },
  );

  it('should not attempting deleting temporary exceptional-minor NPM dist tags', async () => {
    const action = setupReleaseActionForTesting(
      CutStableAction,
      new ActiveReleaseTrains({
        exceptionalMinor: null,
        // No longer in feature-freeze but in release-candidate phase.
        releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
      }),
    );

    await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0', 'latest', {
      willShowAsLatestOnGitHub: true,
    });

    expect(ExternalCommands.invokeDeleteNpmDistTag).toHaveBeenCalledTimes(0);
  });

  describe('exceptional minor is in-progress', () => {
    it('should create a proper new version and select correct branch', async () => {
      const action = setupReleaseActionForTesting(
        CutStableAction,
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
          exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('11.0.0-next.0')),
        }),
      );

      await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0', 'latest', {
        willShowAsLatestOnGitHub: true,
      });
    });

    it('should update the `package.json` to remove the exceptional minor indicator', async () => {
      const action = setupReleaseActionForTesting(
        CutStableAction,
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
          exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('11.0.0-next.0')),
        }),
      );

      const pkgJsonPath = path.join(action.projectDir, workspaceRelativePackageJsonPath);

      // The test action will just operate in the project dir and think this is
      // the `package.json` for the exceptional minor branch. There is no real Git involved.
      await fs.promises.writeFile(
        pkgJsonPath,
        JSON.stringify({
          version: 'irrelevant',
          [exceptionalMinorPackageIndicator]: true,
        }),
      );

      await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0', 'latest', {
        willShowAsLatestOnGitHub: true,
      });

      const pgkJsonRaw = await fs.promises.readFile(pkgJsonPath, 'utf8');
      const pkgJson = JSON.parse(pgkJsonRaw) as PackageJson;

      expect(pkgJson[exceptionalMinorPackageIndicator]).toBe(undefined);
    });

    it('should delete the temporary exceptional-minor NPM dist tag', async () => {
      const action = setupReleaseActionForTesting(
        CutStableAction,
        new ActiveReleaseTrains({
          latest: new ReleaseTrain('10.0.x', parse('10.0.3')),
          exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('11.0.0-next.0')),
        }),
      );

      await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0', 'latest', {
        willShowAsLatestOnGitHub: true,
      });

      expect(ExternalCommands.invokeDeleteNpmDistTag).toHaveBeenCalledTimes(1);
    });

    it(
      'should generate release notes capturing all associated RC, next releases while ' +
        'deduping commits that have been cherry-picked from patch and are already released',
      async () => {
        const action = setupReleaseActionForTesting(
          CutStableAction,
          new ActiveReleaseTrains({
            latest: new ReleaseTrain('10.0.x', parse('10.0.4')),
            exceptionalMinor: new ReleaseTrain('10.1.x', parse('10.1.0-rc.4')),
            releaseCandidate: null,
            next: new ReleaseTrain('master', parse('11.0.0-next.0')),
          }),
          {useSandboxGitClient: true},
        );

        SandboxGitRepo.withInitialCommit(action.githubConfig)
          .commit('fix(pkg1): landed in all release trains *1')
          .branchOff('10.0.x')
          .commit('fix(pkg1): released in patch *1')
          .createTagForHead('10.0.3')
          .branchOff('10.1.x')
          .switchToBranch('10.0.x')
          // These commits landed after we already branched off.
          .commit('fix(pkg1): released in patch, cherry-picked *1', 1)
          .commit('fix(pkg1): released in patch, cherry-picked *2', 2)
          .createTagForHead('10.0.4')
          .commit('fix(pkg1): landed in patch, not released but cherry-picked *1', 3)
          .switchToBranch('10.1.x')
          .cherryPick(1)
          .cherryPick(2)
          // All commits below are new to this current exceptional minor train, and are expected
          // to be captured in the release notes. The cherry-picked commits from above have
          // already been released as part of `10.0.3` and should be omitted.
          .cherryPick(3)
          .commit('fix(pkg1): released first -next pre-release *1')
          .commit('fix(pkg1): released first -next pre-release *2')
          .createTagForHead('10.1.0-next.0')
          .commit('fix(pkg1): released second -next pre-release *1')
          .commit('fix(pkg1): released second -next pre-release *2')
          .createTagForHead('10.1.0-next.1')
          .commit('fix(pkg1): released -rc pre-release *1')
          .commit('fix(pkg1): released -rc pre-release *2')
          .createTagForHead('10.1.0-rc.0')
          .commit('fix(pkg1): not yet released *1')
          .commit('fix(pkg1): not yet released *2');

        await expectGithubApiRequests(action, '10.1.x', '10.1.0', {
          willShowAsLatestOnGitHub: true,
          withCherryPicking: true,
        });
        await action.instance.perform();

        const changelog = fs.readFileSync(`${testTmpDir}/CHANGELOG.md`, 'utf8');

        expect(changelog).toMatch(changelogPattern`
        # 10.1.0 <..>
        ### pkg1
        | Commit | Type | Description |
        | -- | -- | -- |
        | <..> | fix | landed in patch, not released but cherry-picked *1 |
        | <..> | fix | not yet released *1 |
        | <..> | fix | not yet released *2 |
        | <..> | fix | released -rc pre-release *1 |
        | <..> | fix | released -rc pre-release *2 |
        | <..> | fix | released first -next pre-release *1 |
        | <..> | fix | released first -next pre-release *2 |
        | <..> | fix | released second -next pre-release *1 |
        | <..> | fix | released second -next pre-release *2 |
      `);
      },
    );
  });
});
