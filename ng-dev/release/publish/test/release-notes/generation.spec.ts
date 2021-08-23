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
    describe('categorization', () => {
      it('should group commits by scope by default', async () => {
        SandboxGitRepo.withInitialCommit(githubConfig)
          .createTagForHead('startTag')
          .commit('fix(@angular-devkit/core): commit *1')
          .commit('fix(@angular-devkit/core): commit *2')
          .commit('fix(@angular-devkit/test): commit *3')
          .commit('fix(@angular-devkit/test): commit *4');

        const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), 'startTag', 'HEAD');

        expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### @angular-devkit/core
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | commit *2 |
          | <..> | fix | commit *1 |
          ### @angular-devkit/test
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | commit *4 |
          | <..> | fix | commit *3 |
          ## Special Thanks
        `);
      });

      it('should support custom group names', async () => {
        SandboxGitRepo.withInitialCommit(githubConfig)
          .createTagForHead('startTag')
          .commit('fix(cdk/a11y): commit *1')
          .commit('fix(cdk/platform): commit *2')
          .commit('fix(material/autocomplete): commit *3')
          .commit('fix(material/slide-toggle): commit *4');

        releaseConfig.releaseNotes = {
          // Group commits in the release notes by package name.
          categorizeCommit: (commit) => ({groupName: commit.scope.split('/', 1)[0]}),
        };

        const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), 'startTag', 'HEAD');

        expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### cdk
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | commit *2 |
          | <..> | fix | commit *1 |
          ### material
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | commit *4 |
          | <..> | fix | commit *3 |
          ## Special Thanks
        `);
      });

      it('should support custom descriptions', async () => {
        SandboxGitRepo.withInitialCommit(githubConfig)
          .createTagForHead('startTag')
          .commit('fix(cdk/a11y): fix module definition')
          .commit('fix(cdk/platform): fix detection of chromium');

        releaseConfig.releaseNotes = {
          // Includes the secondary entry-point name in the commit description. This
          // replicates a scenario in the `angular/components` repository where the
          // commits are grouped by package name (e.g. `cdk`) but we still want to
          // incorporate the entry-point information in the release notes.
          categorizeCommit: (commit) => {
            const entryPoint = commit.scope.split('/')[1];
            return {description: `${entryPoint}: ${commit.subject}`};
          },
        };

        const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), 'startTag', 'HEAD');

        expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### cdk/a11y
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | a11y: fix module definition |
          ### cdk/platform
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | platform: fix detection of chromium |
          ## Special Thanks
        `);
      });

      it('should support custom group names together with custom descriptions', async () => {
        SandboxGitRepo.withInitialCommit(githubConfig)
          .createTagForHead('startTag')
          .commit('fix(cdk/a11y): fix module definition')
          .commit('fix(cdk/platform): fix detection of chromium')
          .commit('fix(material/slider/testing): missing stabilization');

        releaseConfig.releaseNotes = {
          // Includes the secondary entry-point name in the commit description. This
          // replicates a scenario in the `angular/components` repository where the
          // commits are grouped by package name (e.g. `cdk`) but we still want to
          // incorporate the entry-point information in the release notes.
          categorizeCommit: (commit) => {
            const [packageName, ...entryPointParts] = commit.scope.split('/');
            const entryPoint = entryPointParts.join('/');
            return {
              groupName: packageName,
              description: `${entryPoint}: ${commit.subject}`,
            };
          },
        };

        const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), 'startTag', 'HEAD');

        expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### cdk
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | platform: fix detection of chromium |
          | <..> | fix | a11y: fix module definition |
          ### material
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | slider/testing: missing stabilization |
          ## Special Thanks
        `);
      });
    });

    it('should convert pull request references to links', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .createTagForHead('startTag')
        .commit('fix(@angular-devkit/test): commit #1')
        .commit('fix(@angular-devkit/test): commit (#2)');

      const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), 'startTag', 'HEAD');

      expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
        # 13.0.0 <..>
        ### @angular-devkit/test
        | Commit | Type | Description |
        | -- | -- | -- |
        | <..> | fix | commit ([#2](<..>/pull/2)) |
        | <..> | fix | commit [#1](<..>/pull/1) |
        ## Special Thanks
      `);
    });

    it('should capture breaking changes', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released *1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released *1')
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
        | Commit | Type | Description |
        | -- | -- | -- |
        | <..> | fix | not yet released *1 |
        | <..> | refactor | with breaking change |
        ## Special Thanks
      `);
    });

    it('should capture deprecations', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released *1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released *1')
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
        | Commit | Type | Description |
        | -- | -- | -- |
        | <..> | fix | not yet released *1 |
        | <..> | refactor | with deprecation |
        ## Special Thanks
      `);
    });
  });

  describe('github release notes', () => {
    describe('categorization', () => {
      it('should group commits by scope by default', async () => {
        SandboxGitRepo.withInitialCommit(githubConfig)
          .createTagForHead('startTag')
          .commit('fix(@angular-devkit/core): commit *1')
          .commit('fix(@angular-devkit/core): commit *2')
          .commit('fix(@angular-devkit/test): commit *3')
          .commit('fix(@angular-devkit/test): commit *4');

        const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), 'startTag', 'HEAD');

        expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### @angular-devkit/core
          | Commit | Description |
          | -- | -- |
          | <..> | commit *2 |
          | <..> | commit *1 |
          ### @angular-devkit/test
          | Commit | Description |
          | -- | -- |
          | <..> | commit *4 |
          | <..> | commit *3 |
          ## Special Thanks
        `);
      });

      it('should support custom group names', async () => {
        SandboxGitRepo.withInitialCommit(githubConfig)
          .createTagForHead('startTag')
          .commit('fix(cdk/a11y): commit *1')
          .commit('fix(cdk/platform): commit *2')
          .commit('fix(material/autocomplete): commit *3')
          .commit('fix(material/slide-toggle): commit *4');

        releaseConfig.releaseNotes = {
          // Group commits in the release notes by package name.
          categorizeCommit: (commit) => ({groupName: commit.scope.split('/', 1)[0]}),
        };

        const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), 'startTag', 'HEAD');

        expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### cdk
          | Commit | Description |
          | -- | -- |
          | <..> | commit *2 |
          | <..> | commit *1 |
          ### material
          | Commit | Description |
          | -- | -- |
          | <..> | commit *4 |
          | <..> | commit *3 |
          ## Special Thanks
        `);
      });

      it('should support custom descriptions', async () => {
        SandboxGitRepo.withInitialCommit(githubConfig)
          .createTagForHead('startTag')
          .commit('fix(cdk/a11y): fix module definition')
          .commit('fix(cdk/platform): fix detection of chromium');

        releaseConfig.releaseNotes = {
          // Includes the secondary entry-point name in the commit description. This
          // replicates a scenario in the `angular/components` repository where the
          // commits are grouped by package name (e.g. `cdk`) but we still want to
          // incorporate the entry-point information in the release notes.
          categorizeCommit: (commit) => {
            const entryPoint = commit.scope.split('/')[1];
            return {description: `${entryPoint}: ${commit.subject}`};
          },
        };

        const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), 'startTag', 'HEAD');

        expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### cdk/a11y
          | Commit | Description |
          | -- | -- |
          | <..> | a11y: fix module definition |
          ### cdk/platform
          | Commit | Description |
          | -- | -- |
          | <..> | platform: fix detection of chromium |
          ## Special Thanks
        `);
      });

      it('should support custom group names together with custom descriptions', async () => {
        SandboxGitRepo.withInitialCommit(githubConfig)
          .createTagForHead('startTag')
          .commit('fix(cdk/a11y): fix module definition')
          .commit('fix(cdk/platform): fix detection of chromium')
          .commit('fix(material/slider/testing): missing stabilization');

        releaseConfig.releaseNotes = {
          // Includes the secondary entry-point name in the commit description. This
          // replicates a scenario in the `angular/components` repository where the
          // commits are grouped by package name (e.g. `cdk`) but we still want to
          // incorporate the entry-point information in the release notes.
          categorizeCommit: (commit) => {
            const [packageName, ...entryPointParts] = commit.scope.split('/');
            const entryPoint = entryPointParts.join('/');
            return {
              groupName: packageName,
              description: `${entryPoint}: ${commit.subject}`,
            };
          },
        };

        const releaseNotes = await ReleaseNotes.forRange(parse('13.0.0'), 'startTag', 'HEAD');

        expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### cdk
          | Commit | Description |
          | -- | -- |
          | <..> | platform: fix detection of chromium |
          | <..> | a11y: fix module definition |
          ### material
          | Commit | Description |
          | -- | -- |
          | <..> | slider/testing: missing stabilization |
          ## Special Thanks
        `);
      });
    });

    it('should capture breaking changes', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released *1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released *1')
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
        | <..> | not yet released *1 |
        | <..> | with breaking change |
        ## Special Thanks
      `);
    });

    it('should capture deprecations', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released *1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released *1')
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
        | <..> | not yet released *1 |
        | <..> | with deprecation |
        ## Special Thanks
      `);
    });
  });
});
