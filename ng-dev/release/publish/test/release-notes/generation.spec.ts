/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {installSandboxGitClient, SandboxGitClient} from '../test-utils/sandbox-git-client';
import {mkdirSync, rmdirSync} from 'fs';
import {testTmpDir} from '../test-utils/action-mocks';
import {getMockGitClient} from '../test-utils/git-client-mock';
import {GithubConfig} from '../../../../utils/config';
import {SandboxGitRepo} from '../test-utils/sandbox-testing';
import {ReleaseNotes} from '../../../notes/release-notes';
import {ReleaseConfig} from '../../../config';
import {changelogPattern, parse} from '../test-utils/test-utils';

describe('release notes generation', () => {
  let releaseConfig: ReleaseConfig;
  let githubConfig: GithubConfig;
  let client: SandboxGitClient;

  beforeEach(() => {
    // Clear the temporary directory used by the sandbox git client. We do not want
    // the repo state to persist between tests.
    rmdirSync(testTmpDir, {recursive: true});
    mkdirSync(testTmpDir);

    releaseConfig = {npmPackages: [], buildPackages: async () => []};
    githubConfig = {owner: 'angular', name: 'dev-infra-test', mainBranchName: 'main'};
    client = getMockGitClient(githubConfig, /* useSandboxGitClient */ true);

    installSandboxGitClient(client);

    // Ensure the `ReleaseNotes` class picks up the fake release config for testing.
    spyOn(ReleaseNotes.prototype as any, 'getReleaseConfig').and.callFake(() => releaseConfig);
  });

  describe('changelog', () => {
    it('should capture breaking changes', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released #1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released #1')
        .commit(
          'refactor(cdk/a11y): with breaking change\n\n' +
            'BREAKING CHANGE: Description of breaking change.',
        );

      const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), '13.0.0-next.0', 'HEAD');

      expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
        # 13.0.0 <..>
        ## Breaking Changes
        ### cdk/a11y
        - Description of breaking change.
        ### cdk/a11y
        | Commit | Description |
        | -- | -- |
        | <..> | fix: not yet released #1 |
        | <..> | refactor: with breaking change |
        ## Special Thanks:
      `);
    });

    it('should capture deprecations', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released #1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released #1')
        .commit(
          'refactor(cdk/a11y): with deprecation\n\n' + 'DEPRECATED: Description of deprecation.',
        );

      const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), '13.0.0-next.0', 'HEAD');

      expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
        # 13.0.0 <..>
        ## Deprecations
        ### cdk/a11y
        - Description of deprecation.
        ### cdk/a11y
        | Commit | Description |
        | -- | -- |
        | <..> | fix: not yet released #1 |
        | <..> | refactor: with deprecation |
        ## Special Thanks:
      `);
    });
  });

  describe('github release notes', () => {
    it('should capture breaking changes', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released #1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released #1')
        .commit(
          'refactor(cdk/a11y): with breaking change\n\n' +
            'BREAKING CHANGE: Description of breaking change.',
        );

      const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), '13.0.0-next.0', 'HEAD');

      expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
        # 13.0.0 <..>
        ## Breaking Changes
        ### cdk/a11y
        - Description of breaking change.
        ### cdk/a11y
        | Commit | Description |
        | -- | -- |
        | <..> | not yet released #1 |
        | <..> | with breaking change |
        ## Special Thanks:
      `);
    });

    it('should capture deprecations', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released #1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released #1')
        .commit(
          'refactor(cdk/a11y): with deprecation\n\n' + 'DEPRECATED: Description of deprecation.',
        );

      const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), '13.0.0-next.0', 'HEAD');

      expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
        # 13.0.0 <..>
        ## Deprecations
        ### cdk/a11y
        - Description of deprecation.
        ### cdk/a11y
        | Commit | Description |
        | -- | -- |
        | <..> | not yet released #1 |
        | <..> | with deprecation |
        ## Special Thanks:
      `);
    });
  });
});
