/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubConfig, setConfig} from '../../../../utils/config';
import {
  getMockGitClient,
  installSandboxGitClient,
  SandboxGitClient,
  SandboxGitRepo,
} from '../../../../utils/testing';
import {ReleaseConfig} from '../../../config';
import {ReleaseNotes} from '../../../notes/release-notes';
import {prepareTempDirectory} from '../test-utils/action-mocks';
import {changelogPattern, parse} from '../test-utils/test-utils';

describe('release notes generation', () => {
  let releaseConfig: ReleaseConfig;
  let githubConfig: GithubConfig;
  let client: SandboxGitClient;

  beforeEach(() => {
    // Clear the temporary directory used by the sandbox git client. We do not want
    // the repo state to persist between tests.
    prepareTempDirectory();

    releaseConfig = {
      npmPackages: [{name: 'test-pkg'}],
      representativeNpmPackage: 'test-pkg',
      buildPackages: async () => [],
    };
    githubConfig = {owner: 'angular', name: 'dev-infra-test', mainBranchName: 'main'};
    setConfig({github: githubConfig, release: releaseConfig});
    client = getMockGitClient(githubConfig, /* useSandboxGitClient */ true);

    installSandboxGitClient(client);
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

        const releaseNotes = await ReleaseNotes.forRange(
          client,
          parse('13.0.0'),
          'startTag',
          'HEAD',
        );

        expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### @angular-devkit/core
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | commit *1 |
          | <..> | fix | commit *2 |
          ### @angular-devkit/test
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | commit *3 |
          | <..> | fix | commit *4 |
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

        const releaseNotes = await ReleaseNotes.forRange(
          client,
          parse('13.0.0'),
          'startTag',
          'HEAD',
        );

        expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### cdk
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | commit *1 |
          | <..> | fix | commit *2 |
          ### material
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | commit *3 |
          | <..> | fix | commit *4 |
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

        const releaseNotes = await ReleaseNotes.forRange(
          client,
          parse('13.0.0'),
          'startTag',
          'HEAD',
        );

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

        const releaseNotes = await ReleaseNotes.forRange(
          client,
          parse('13.0.0'),
          'startTag',
          'HEAD',
        );

        expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### cdk
          | Commit | Type | Description |
          | -- | -- | -- |
          | <..> | fix | a11y: fix module definition |
          | <..> | fix | platform: fix detection of chromium |
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

      const releaseNotes = await ReleaseNotes.forRange(client, parse('13.0.0'), 'startTag', 'HEAD');

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

      const releaseNotes = await ReleaseNotes.forRange(
        client,
        parse('13.0.0'),
        '13.0.0-next.0',
        'HEAD',
      );

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

    it('should capture multiple breaking changes from a single commit', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released *1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released *1')
        .commit(
          'refactor(cdk/a11y): with breaking change\n\n' +
            'BREAKING CHANGE: Description of breaking change.\n\n' +
            'BREAKING CHANGE: Description of breaking change 2.',
        );

      const releaseNotes = await ReleaseNotes.forRange(
        client,
        parse('13.0.0'),
        '13.0.0-next.0',
        'HEAD',
      );

      expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
        # 13.0.0 <..>
        ## Breaking Changes
        ### cdk/a11y
        - Description of breaking change.
        - Description of breaking change 2.
        ### cdk/a11y
        | Commit | Type | Description |
        | -- | -- | -- |
        | <..> | fix | not yet released *1 |
        | <..> | refactor | with breaking change |
        ## Special Thanks
      `);
    });

    it('should indent breaking changes with bullets', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released *1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released *1')
        .commit(
          'refactor(cdk/a11y): with breaking change\n\n' +
            'BREAKING CHANGE:\n' +
            'Description of breaking change.\n' +
            '- point 1\n' +
            '- point 2\n',
        );

      const releaseNotes = await ReleaseNotes.forRange(
        client,
        parse('13.0.0'),
        '13.0.0-next.0',
        'HEAD',
      );

      expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
        # 13.0.0 <..>
        ## Breaking Changes
        ### cdk/a11y
        - Description of breaking change.
          - point 1
          - point 2
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

      const releaseNotes = await ReleaseNotes.forRange(
        client,
        parse('13.0.0'),
        '13.0.0-next.0',
        'HEAD',
      );

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

    it('should capture multiple deprecations from a single commit', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released *1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released *1')
        .commit(
          'refactor(cdk/a11y): with deprecation\n\n' +
            'DEPRECATED: Description of deprecation.\n\n' +
            'DEPRECATED: Description of deprecation 2.',
        );

      const releaseNotes = await ReleaseNotes.forRange(
        client,
        parse('13.0.0'),
        '13.0.0-next.0',
        'HEAD',
      );

      expect(await releaseNotes.getChangelogEntry()).toMatch(changelogPattern`
        # 13.0.0 <..>
        ## Deprecations
        ### cdk/a11y
        - Description of deprecation.
        - Description of deprecation 2.
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

        const releaseNotes = await ReleaseNotes.forRange(
          client,
          parse('13.0.0'),
          'startTag',
          'HEAD',
        );

        expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### @angular-devkit/core
          | Commit | Description |
          | -- | -- |
          | <..> | commit *1 |
          | <..> | commit *2 |
          ### @angular-devkit/test
          | Commit | Description |
          | -- | -- |
          | <..> | commit *3 |
          | <..> | commit *4 |
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

        const releaseNotes = await ReleaseNotes.forRange(
          client,
          parse('13.0.0'),
          'startTag',
          'HEAD',
        );

        expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### cdk
          | Commit | Description |
          | -- | -- |
          | <..> | commit *1 |
          | <..> | commit *2 |
          ### material
          | Commit | Description |
          | -- | -- |
          | <..> | commit *3 |
          | <..> | commit *4 |
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

        const releaseNotes = await ReleaseNotes.forRange(
          client,
          parse('13.0.0'),
          'startTag',
          'HEAD',
        );

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

        const releaseNotes = await ReleaseNotes.forRange(
          client,
          parse('13.0.0'),
          'startTag',
          'HEAD',
        );

        expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
          # 13.0.0 <..>
          ### cdk
          | Commit | Description |
          | -- | -- |
          | <..> | a11y: fix module definition |
          | <..> | platform: fix detection of chromium |
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

      const releaseNotes = await ReleaseNotes.forRange(
        client,
        parse('13.0.0'),
        '13.0.0-next.0',
        'HEAD',
      );

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

    it('should capture multiple breaking changes from a single commit', async () => {
      SandboxGitRepo.withInitialCommit(githubConfig)
        .commit('fix(cdk/a11y): already released *1')
        .createTagForHead('13.0.0-next.0')
        .commit('fix(cdk/a11y): not yet released *1')
        .commit(
          'refactor(cdk/a11y): with breaking change\n\n' +
            'BREAKING CHANGE: Description of breaking change.\n\n' +
            'BREAKING CHANGE: Description of breaking change 2.',
        );

      const releaseNotes = await ReleaseNotes.forRange(
        client,
        parse('13.0.0'),
        '13.0.0-next.0',
        'HEAD',
      );

      expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
        # 13.0.0 <..>
        ## Breaking Changes
        ### cdk/a11y
        - Description of breaking change.
        - Description of breaking change 2.
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

      const releaseNotes = await ReleaseNotes.forRange(
        client,
        parse('13.0.0'),
        '13.0.0-next.0',
        'HEAD',
      );

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

  it('should capture multiple deprecations from a single commit', async () => {
    SandboxGitRepo.withInitialCommit(githubConfig)
      .commit('fix(cdk/a11y): already released *1')
      .createTagForHead('13.0.0-next.0')
      .commit('fix(cdk/a11y): not yet released *1')
      .commit(
        'refactor(cdk/a11y): with deprecation\n\n' +
          'DEPRECATED: Description of deprecation.\n\n' +
          'DEPRECATED: Description of deprecation 2.',
      );

    const releaseNotes = await ReleaseNotes.forRange(
      client,
      parse('13.0.0'),
      '13.0.0-next.0',
      'HEAD',
    );

    expect(await releaseNotes.getGithubReleaseEntry()).toMatch(changelogPattern`
      # 13.0.0 <..>
      ## Deprecations
      ### cdk/a11y
      - Description of deprecation.
      - Description of deprecation 2.
      ### cdk/a11y
      | Commit | Description |
      | -- | -- |
      | <..> | not yet released *1 |
      | <..> | with deprecation |
      ## Special Thanks
    `);
  });

  it('should determine the number of commits included in the entry', async () => {
    SandboxGitRepo.withInitialCommit(githubConfig)
      .createTagForHead('0.0.0')
      .commit('fix: first thing fixed')
      .commit('feat: first new thing')
      .commit('feat: second new thing')
      .commit('build: rework everything')
      .commit('fix: fix what we broke');

    const releaseNotes = await ReleaseNotes.forRange(client, parse('0.0.1'), '0.0.0', 'HEAD');

    expect(await releaseNotes.getCommitCountInReleaseNotes()).toBe(4);
  });

  it('should insert correct shortened and full shas for commits', async () => {
    const sandboxRepo = SandboxGitRepo.withInitialCommit(githubConfig)
      .createTagForHead('startTag')
      .commit('fix(ng-dev): commit *1', 1);

    const fullSha = sandboxRepo.getShaForCommitId(1, 'long');
    const shortSha = sandboxRepo.getShaForCommitId(1, 'short');

    const releaseNotes = await ReleaseNotes.forRange(client, parse('13.0.0'), 'startTag', 'HEAD');
    const changelog = await releaseNotes.getChangelogEntry();

    expect(changelog).toContain(
      `| [${shortSha}](https://github.com/angular/dev-infra-test/commit/${fullSha}) | fix | commit *1 |`,
    );
  });
});
