/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PublishCiTool} from './publish-ci.js';
import {ReleaseConfig} from '../../../../ng-dev/release/config/index.js';
import {GithubConfig, setConfig} from '../../../../ng-dev/utils/config.js';
import {
  getMockGitClient,
  installSandboxGitClient,
  SandboxGitRepo,
  testTmpDir,
  runGitInTmpDir,
} from '../../../../ng-dev/utils/testing/index.js';
import {prepareTempDirectory} from '../../../../ng-dev/release/publish/test/test-utils/action-mocks.js';
import {fakeNpmPackageQueryRequest} from '../../../../ng-dev/release/publish/test/test-utils/test-utils.js';
import {ReleaseNotes} from '../../../../ng-dev/release/notes/release-notes.js';
import {NpmCommand} from '../../../../ng-dev/release/versioning/npm-command.js';
import {ActiveReleaseTrains} from '../../../../ng-dev/release/versioning/active-release-trains.js';
import {ReleaseTrain} from '../../../../ng-dev/release/versioning/release-trains.js';
import semver from 'semver';
import * as fs from 'fs';
import * as path from 'path';
import {Log} from '../../../../ng-dev/utils/logging.js';

class RequestError extends Error {
  request = {};
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'RequestError';
  }
}

/** Helper to mock a built .tgz package in the dist directory. */
function mockTgzPackage(builtPackagesDir: string, name: string, version: string): string {
  const scopeAndName = name.startsWith('@') ? name.slice(1) : name;
  const fileName = `${scopeAndName.replace(/\//g, '-')}-${version}.tgz`;
  const tgzPath = path.join(builtPackagesDir, fileName);
  fs.mkdirSync(path.dirname(tgzPath), {recursive: true});
  fs.writeFileSync(tgzPath, 'dummy-tgz-content');
  return tgzPath;
}

describe('PublishCiTool', () => {
  let githubConfig: GithubConfig;
  let releaseConfig: ReleaseConfig;
  let gitClient: any;
  let createRefSpy: jasmine.Spy;
  let createReleaseSpy: jasmine.Spy;
  let publishSpy: jasmine.Spy;

  beforeEach(() => {
    prepareTempDirectory();
    githubConfig = {
      mergeMode: 'caretaker-only' as any,
      owner: 'angular',
      name: 'angular',
      mainBranchName: 'main',
    };
    releaseConfig = {
      representativeNpmPackage: '@angular/core',
      npmPackages: [{name: '@angular/core'}],
      buildPackages: async () => [],
    };
    setConfig({github: githubConfig, release: releaseConfig});
    gitClient = getMockGitClient(githubConfig, true);
    installSandboxGitClient(gitClient);

    // Populate NPM package info cache to avoid real fetch calls
    fakeNpmPackageQueryRequest('@angular/core', {});
    fakeNpmPackageQueryRequest('@angular/common', {});

    // Mock NpmCommand.publish
    publishSpy = spyOn(NpmCommand, 'publish').and.resolveTo();
    spyOn(NpmCommand, 'checkVersionExists').and.resolveTo(false);

    // Mock GitHub API calls using a plain mock object to avoid Proxy issues
    createRefSpy = jasmine.createSpy('createRef').and.resolveTo({});
    createReleaseSpy = jasmine.createSpy('createRelease').and.resolveTo({});
    const mockGithub = {
      git: {
        createRef: createRefSpy,
      },
      repos: {
        createRelease: createReleaseSpy,
      },
    };
    Object.defineProperty(gitClient, 'github', {
      value: mockGithub,
      writable: true,
      configurable: true,
    });

    // Mock ActiveReleaseTrains.fetch
    spyOn(ActiveReleaseTrains, 'fetch').and.resolveTo(
      new ActiveReleaseTrains({
        exceptionalMinor: null,
        releaseCandidate: null,
        next: new ReleaseTrain('main', semver.parse('10.1.0-next.0')!),
        latest: new ReleaseTrain('10.0.x', semver.parse('10.0.0')!),
      }),
    );
  });

  it('should verify HEAD SHA matches expectedSha', async () => {
    // Write package.json v10.0.0
    fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
    const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

    // Get the HEAD SHA of the sandbox repo
    const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

    const toolWithMismatchedSha = new PublishCiTool(
      {github: githubConfig, release: releaseConfig} as any,
      gitClient,
      testTmpDir,
      {
        builtPackagesDir: path.join(testTmpDir, 'dist'),
        expectedSha: 'incorrect-sha-12345',
        dryRun: true,
      },
    );

    await expectAsync(toolWithMismatchedSha.run()).toBeRejectedWithError(
      `Expected HEAD SHA to be incorrect-sha-12345, but got ${headSha}.`,
    );

    const toolWithCorrectSha = new PublishCiTool(
      {github: githubConfig, release: releaseConfig} as any,
      gitClient,
      testTmpDir,
      {
        builtPackagesDir: path.join(testTmpDir, 'dist'),
        expectedSha: headSha,
      },
    );

    // Mock ReleaseNotes.forRange and other dependencies so it runs successfully
    const releaseNotesSpy = spyOn(ReleaseNotes, 'forRange').and.resolveTo({
      getGithubReleaseEntry: async () => 'release notes body',
      getUrlFragmentForRelease: async () => 'url-frag',
    } as any);

    // Prepare dummy built package output
    const builtPackagesDir = path.join(testTmpDir, 'dist');
    mockTgzPackage(builtPackagesDir, '@angular/core', '10.0.0');

    process.env['WOMBOT_TOKEN'] = 'mock-wombat-token';

    await expectAsync(toolWithCorrectSha.run()).toBeResolved();
  });

  describe('fail-fast validation', () => {
    let originalWombotToken: string | undefined;

    beforeEach(() => {
      originalWombotToken = process.env['WOMBOT_TOKEN'];
      delete process.env['WOMBOT_TOKEN'];
    });

    afterEach(() => {
      if (originalWombotToken !== undefined) {
        process.env['WOMBOT_TOKEN'] = originalWombotToken;
      } else {
        delete process.env['WOMBOT_TOKEN'];
      }
    });

    it('should throw if WOMBOT_TOKEN is missing (dryRun: false) and not call GitHub API', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir: path.join(testTmpDir, 'dist'),
          expectedSha: headSha,
          dryRun: false,
        },
      );

      await expectAsync(tool.run()).toBeRejectedWithError(
        'WOMBOT_TOKEN environment variable is not defined.',
      );

      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
    });

    it('should NOT throw if WOMBOT_TOKEN is missing when dryRun is true', async () => {
      spyOn(ReleaseNotes, 'forRange').and.resolveTo({
        getGithubReleaseEntry: async () => 'release notes body',
        getUrlFragmentForRelease: async () => 'url-frag',
      } as any);

      const builtPackagesDir = path.join(testTmpDir, 'dist');
      mockTgzPackage(builtPackagesDir, '@angular/core', '10.0.0');

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir: builtPackagesDir,
          expectedSha: headSha,
          dryRun: true,
        },
      );

      await expectAsync(tool.run()).toBeResolved();
    });

    it('should throw if built packages directory does not exist and not call GitHub API', async () => {
      process.env['WOMBOT_TOKEN'] = 'mock-wombat-token';

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const nonExistentDir = path.join(testTmpDir, 'non-existent-dist');

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir: nonExistentDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeRejectedWithError(
        `The built packages directory does not exist: ${nonExistentDir}`,
      );

      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
    });

    it('should throw if no built packages are found and not call GitHub API', async () => {
      process.env['WOMBOT_TOKEN'] = 'mock-wombat-token';

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const emptyDir = path.join(testTmpDir, 'empty-dist');
      fs.mkdirSync(emptyDir, {recursive: true});

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir: emptyDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeRejectedWithError(
        `Expected built package file not found: ${path.join(emptyDir, 'angular-core-10.0.0.tgz')}`,
      );

      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
    });
  });

  describe('git graph traversal (beforeStagingSha)', () => {
    let releaseNotesSpy: jasmine.Spy;
    let builtPackagesDir: string;

    beforeEach(() => {
      releaseNotesSpy = spyOn(ReleaseNotes, 'forRange').and.resolveTo({
        getGithubReleaseEntry: async () => 'release notes body',
        getUrlFragmentForRelease: async () => 'url-frag',
      } as any);

      builtPackagesDir = path.join(testTmpDir, 'dist');

      process.env['WOMBOT_TOKEN'] = 'mock-wombat-token';
    });

    it('should resolve beforeStagingSha for standard merge commit', async () => {
      // 1. Initial commit (v10.0.0)
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);
      const mainParentSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      // 2. Tag v10.0.0
      sandbox.createTagForHead('v10.0.0');

      // 3. Create branch `staging-branch`
      sandbox.branchOff('staging-branch');

      // 4. On `staging-branch`, make commit bumping version to 10.1.0-next.0 and update CHANGELOG.md
      fs.writeFileSync(
        path.join(testTmpDir, 'package.json'),
        JSON.stringify({version: '10.1.0-next.0'}),
      );
      fs.writeFileSync(path.join(testTmpDir, 'CHANGELOG.md'), 'changelog contents');
      sandbox.commit('release: bump version to 10.1.0-next.0');

      // 5. Switch back to main branch
      sandbox.switchToBranch('main');

      // 6. Merge staging-branch into main with a merge commit
      runGitInTmpDir(['merge', 'staging-branch', '--no-ff', '-m', 'Merge branch staging-branch']);
      const mergeCommitSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0-next.0');

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: mergeCommitSha,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      // Assert that ReleaseNotes.forRange was called with beforeStagingSha as baseRef
      expect(releaseNotesSpy).toHaveBeenCalledTimes(1);
      const args = releaseNotesSpy.calls.mostRecent().args;
      expect(args[1]).toEqual(semver.parse('10.1.0-next.0')!); // newVersion
      expect(args[2]).toBe('v10.0.0'); // previousVersionTag
      expect(args[3]).toBe(mainParentSha); // beforeStagingSha
    });

    it('should resolve beforeStagingSha for squash/rebase commit', async () => {
      // 1. Initial commit (v10.0.0)
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);
      const initialCommitSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      // 2. Create single commit bumping version to 10.1.0-next.0
      fs.writeFileSync(
        path.join(testTmpDir, 'package.json'),
        JSON.stringify({version: '10.1.0-next.0'}),
      );
      sandbox.commit('release: bump version to 10.1.0-next.0');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0-next.0');

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      expect(releaseNotesSpy).toHaveBeenCalledTimes(1);
      const args = releaseNotesSpy.calls.mostRecent().args;
      expect(args[1]).toEqual(semver.parse('10.1.0-next.0')!); // newVersion
      expect(args[2]).toBe('v10.0.0'); // previousVersionTag
      expect(args[3]).toBe(initialCommitSha); // beforeStagingSha
    });
  });

  describe('previousVersionTag resolution', () => {
    let releaseNotesSpy: jasmine.Spy;
    let builtPackagesDir: string;

    beforeEach(() => {
      releaseNotesSpy = spyOn(ReleaseNotes, 'forRange').and.resolveTo({
        getGithubReleaseEntry: async () => 'release notes body',
        getUrlFragmentForRelease: async () => 'url-frag',
      } as any);

      builtPackagesDir = path.join(testTmpDir, 'dist');

      process.env['WOMBOT_TOKEN'] = 'mock-wombat-token';
    });

    it('should resolve highest stable tag when transitioning from prerelease to stable', async () => {
      // 1. Create tags v9.0.0, v10.0.0, v10.1.0-rc.0 pointing to different commits
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '9.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);
      sandbox.createTagForHead('v9.0.0');

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      sandbox.commit('v10.0.0 commit');
      sandbox.createTagForHead('v10.0.0');

      fs.writeFileSync(
        path.join(testTmpDir, 'package.json'),
        JSON.stringify({version: '10.1.0-rc.0'}),
      );
      sandbox.commit('v10.1.0-rc.0 commit');
      sandbox.createTagForHead('v10.1.0-rc.0');

      // 2. Set version at HEAD to 10.1.0 (stable)
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 stable commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      expect(releaseNotesSpy).toHaveBeenCalledTimes(1);
      const args = releaseNotesSpy.calls.mostRecent().args;
      expect(args[2]).toBe('v10.0.0'); // previousVersionTag (should skip v10.1.0-rc.0 because it's prerelease)
    });

    it('should resolve previous prerelease tag when incrementing prerelease', async () => {
      // 1. Set version at beforeStagingSha to 10.1.0-next.0
      fs.writeFileSync(
        path.join(testTmpDir, 'package.json'),
        JSON.stringify({version: '10.1.0-next.0'}),
      );
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      // 2. Set version at HEAD to 10.1.0-next.1
      fs.writeFileSync(
        path.join(testTmpDir, 'package.json'),
        JSON.stringify({version: '10.1.0-next.1'}),
      );
      sandbox.commit('v10.1.0-next.1 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0-next.1');

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      expect(releaseNotesSpy).toHaveBeenCalledTimes(1);
      const args = releaseNotesSpy.calls.mostRecent().args;
      expect(args[2]).toBe('v10.1.0-next.0'); // previousVersionTag
    });
  });

  describe('GitHub release and tag creation (idempotency)', () => {
    let releaseNotesSpy: jasmine.Spy;
    let builtPackagesDir: string;

    beforeEach(() => {
      releaseNotesSpy = spyOn(ReleaseNotes, 'forRange').and.resolveTo({
        getGithubReleaseEntry: async () => 'release notes body',
        getUrlFragmentForRelease: async () => 'url-frag',
      } as any);

      builtPackagesDir = path.join(testTmpDir, 'dist');

      process.env['WOMBOT_TOKEN'] = 'mock-wombat-token';
    });

    it('should create tags and releases with correct arguments', async () => {
      fs.writeFileSync(
        path.join(testTmpDir, 'package.json'),
        JSON.stringify({version: '10.1.0-next.0'}),
      );
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(
        path.join(testTmpDir, 'package.json'),
        JSON.stringify({version: '10.1.0-next.1'}),
      );
      sandbox.commit('v10.1.0-next.1 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0-next.1');

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      expect(createRefSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          ref: 'refs/tags/v10.1.0-next.1',
          sha: headSha,
        }),
      );
      expect(createReleaseSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'v10.1.0-next.1',
          tag_name: 'v10.1.0-next.1',
          prerelease: true,
          make_latest: 'false',
          body: 'release notes body',
        }),
      );
    });

    it('should proceed to publish even if tag or release already exists', async () => {
      fs.writeFileSync(
        path.join(testTmpDir, 'package.json'),
        JSON.stringify({version: '10.1.0-next.0'}),
      );
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(
        path.join(testTmpDir, 'package.json'),
        JSON.stringify({version: '10.1.0-next.1'}),
      );
      sandbox.commit('v10.1.0-next.1 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0-next.1');

      createRefSpy.and.rejectWith(new RequestError('Reference already exists', 422));
      createReleaseSpy.and.rejectWith(new RequestError('Release already exists', 422));

      const warnSpy = spyOn(Log, 'warn');

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      expect(warnSpy).toHaveBeenCalledWith(
        jasmine.stringMatching('Tag v10.1.0-next.1 already exists, skipping tag creation.'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(
          'GitHub release for v10.1.0-next.1 already exists, skipping release creation.',
        ),
      );
      expect(publishSpy).toHaveBeenCalled();
    });
  });

  it('should create monorepo tags if there are multiple npm packages configured', async () => {
    const monorepoReleaseConfig = {
      representativeNpmPackage: '@angular/core',
      npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
      buildPackages: async () => [],
    };
    setConfig({github: githubConfig, release: monorepoReleaseConfig});

    fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
    const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

    fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
    sandbox.commit('v10.1.0 commit');
    const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

    spyOn(ReleaseNotes, 'forRange').and.resolveTo({
      getGithubReleaseEntry: async () => 'release notes body',
      getUrlFragmentForRelease: async () => 'url-frag',
    } as any);

    const builtPackagesDir = path.join(testTmpDir, 'dist');
    mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
    mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

    process.env['WOMBOT_TOKEN'] = 'mock-wombat-token';

    const tool = new PublishCiTool(
      {github: githubConfig, release: monorepoReleaseConfig} as any,
      gitClient,
      testTmpDir,
      {
        builtPackagesDir,
        expectedSha: headSha,
      },
    );

    await expectAsync(tool.run()).toBeResolved();

    expect(createRefSpy).toHaveBeenCalledTimes(3);
    expect(createRefSpy.calls.argsFor(0)[0]).toEqual(
      jasmine.objectContaining({
        ref: 'refs/tags/v10.1.0',
        sha: headSha,
      }),
    );
    expect(createRefSpy.calls.argsFor(1)[0]).toEqual(
      jasmine.objectContaining({
        ref: 'refs/tags/@angular/core@10.1.0',
        sha: headSha,
      }),
    );
    expect(createRefSpy.calls.argsFor(2)[0]).toEqual(
      jasmine.objectContaining({
        ref: 'refs/tags/@angular/common@10.1.0',
        sha: headSha,
      }),
    );
  });

  describe('NPM publishing & Wombat registry setup', () => {
    let releaseNotesSpy: jasmine.Spy;
    let builtPackagesDir: string;
    let npmrcPath: string;
    let originalNpmConfigUserconfig: string | undefined;

    beforeEach(() => {
      releaseNotesSpy = spyOn(ReleaseNotes, 'forRange').and.resolveTo({
        getGithubReleaseEntry: async () => 'release notes body',
        getUrlFragmentForRelease: async () => 'url-frag',
      } as any);

      builtPackagesDir = path.join(testTmpDir, 'dist');
      npmrcPath = path.join(testTmpDir, '.npmrc');

      process.env['WOMBOT_TOKEN'] = 'mock-wombat-token';

      originalNpmConfigUserconfig = process.env['NPM_CONFIG_USERCONFIG'];
      delete process.env['NPM_CONFIG_USERCONFIG'];
    });

    afterEach(() => {
      if (originalNpmConfigUserconfig !== undefined) {
        process.env['NPM_CONFIG_USERCONFIG'] = originalNpmConfigUserconfig;
      } else {
        delete process.env['NPM_CONFIG_USERCONFIG'];
      }
    });

    it('should temporarily write wombat registry token to a temp .npmrc and clean up afterwards', async () => {
      const testReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
        buildPackages: async () => [],
      };
      setConfig({github: githubConfig, release: testReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const pkg1Path = mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      const pkg2Path = mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      let npmrcContentDuringPublish: string | null = null;
      let tempNpmrcPath: string | undefined;
      publishSpy.and.callFake(async () => {
        tempNpmrcPath = process.env['NPM_CONFIG_USERCONFIG'];
        if (tempNpmrcPath && fs.existsSync(tempNpmrcPath)) {
          npmrcContentDuringPublish = fs.readFileSync(tempNpmrcPath, 'utf8');
        }
      });

      const tool = new PublishCiTool(
        {github: githubConfig, release: testReleaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      // Verify .npmrc does not exist initially in project dir
      expect(fs.existsSync(npmrcPath)).toBe(false);
      expect(process.env['NPM_CONFIG_USERCONFIG']).toBeUndefined();

      await expectAsync(tool.run()).toBeResolved();

      // Verify temp npmrc was created and had correct content
      expect(tempNpmrcPath).toBeDefined();
      expect<string | null>(npmrcContentDuringPublish).toContain(
        'registry=https://wombat-dressing-room.appspot.com/',
      );
      expect<string | null>(npmrcContentDuringPublish).toContain(
        '//wombat-dressing-room.appspot.com/:_authToken=${WOMBOT_TOKEN}',
      );

      // Verify that the temp npmrc file and its directory are deleted
      expect(fs.existsSync(tempNpmrcPath!)).toBe(false);
      expect(fs.existsSync(path.dirname(tempNpmrcPath!))).toBe(false);

      // Verify project .npmrc was NOT created
      expect(fs.existsSync(npmrcPath)).toBe(false);

      // Verify env var was cleaned up
      expect(process.env['NPM_CONFIG_USERCONFIG']).toBeUndefined();

      // Verify NpmCommand.publish was called for both packages with correct arguments
      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy.calls.argsFor(0)).toEqual([pkg1Path, 'latest', undefined]);
      expect(publishSpy.calls.argsFor(1)).toEqual([pkg2Path, 'latest', undefined]);
    });

    it('should preserve original NPM_CONFIG_USERCONFIG and leave project .npmrc untouched', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');

      const originalNpmrcContent = 'registry=https://my-custom-registry.com/\n';
      fs.writeFileSync(npmrcPath, originalNpmrcContent);

      const originalUserconfig = 'original-userconfig-path';
      process.env['NPM_CONFIG_USERCONFIG'] = originalUserconfig;

      let tempNpmrcPath: string | undefined;
      let npmrcContentDuringPublish: string | null = null;
      publishSpy.and.callFake(async () => {
        tempNpmrcPath = process.env['NPM_CONFIG_USERCONFIG'];
        if (tempNpmrcPath && fs.existsSync(tempNpmrcPath)) {
          npmrcContentDuringPublish = fs.readFileSync(tempNpmrcPath, 'utf8');
        }
      });

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      // Verify that temp npmrc was used and configured correctly
      expect(tempNpmrcPath).toBeDefined();
      expect(tempNpmrcPath).not.toBe(originalUserconfig);
      expect<string | null>(npmrcContentDuringPublish).toContain(
        'registry=https://wombat-dressing-room.appspot.com/',
      );

      // Verify that original project .npmrc is completely untouched
      expect(fs.existsSync(npmrcPath)).toBe(true);
      expect(fs.readFileSync(npmrcPath, 'utf8')).toBe(originalNpmrcContent);

      // Verify that original NPM_CONFIG_USERCONFIG is restored
      expect(process.env['NPM_CONFIG_USERCONFIG']).toBe(originalUserconfig);
    });

    it('should restore NPM_CONFIG_USERCONFIG even if publishing fails', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');

      const originalNpmrcContent = 'registry=https://my-custom-registry.com/\n';
      fs.writeFileSync(npmrcPath, originalNpmrcContent);

      const originalUserconfig = 'original-userconfig-path';
      process.env['NPM_CONFIG_USERCONFIG'] = originalUserconfig;

      publishSpy.and.rejectWith(new Error('Npm publish error'));

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeRejectedWithError(
        /Publish failed with the following errors:\nPackage "@angular\/core@10.1.0" failed to publish: Error: Npm publish error/,
      );

      // Verify that original project .npmrc is untouched
      expect(fs.existsSync(npmrcPath)).toBe(true);
      expect(fs.readFileSync(npmrcPath, 'utf8')).toBe(originalNpmrcContent);

      // Verify that original NPM_CONFIG_USERCONFIG is restored
      expect(process.env['NPM_CONFIG_USERCONFIG']).toBe(originalUserconfig);
    });

    it('should deprecate packages if configured', async () => {
      const deprecateSpy = spyOn(NpmCommand, 'deprecate').and.resolveTo();

      const deprecateReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [
          {name: '@angular/core'},
          {
            name: '@angular/common',
            deprecated: {
              version: '>=9.0.0',
              message: 'Use @angular/core instead',
            },
          },
        ],
        buildPackages: async () => [],
      };
      setConfig({github: githubConfig, release: deprecateReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const pkg1Path = mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      const pkg2Path = mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      const tool = new PublishCiTool(
        {github: githubConfig, release: deprecateReleaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      // Verify publish was called for both
      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy.calls.argsFor(0)).toEqual([pkg1Path, 'latest', undefined]);
      expect(publishSpy.calls.argsFor(1)).toEqual([pkg2Path, 'latest', undefined]);

      // Verify deprecate was called only for @angular/common
      expect(deprecateSpy).toHaveBeenCalledTimes(1);
      expect(deprecateSpy).toHaveBeenCalledWith(
        '@angular/common',
        '>=9.0.0',
        'Use @angular/core instead',
        undefined,
      );
    });

    it('should skip publishing packages that are already published on the registry', async () => {
      const testReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
        buildPackages: async () => [],
      };
      setConfig({github: githubConfig, release: testReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const pkg1Path = mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      const pkg2Path = mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      // Override the global spy to return true only for @angular/core
      const checkVersionSpy = NpmCommand.checkVersionExists as jasmine.Spy;
      checkVersionSpy.and.callFake(async (name) => {
        return name === '@angular/core';
      });

      const tool = new PublishCiTool(
        {github: githubConfig, release: testReleaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      // Verify checkVersionExists was called for both
      expect(checkVersionSpy).toHaveBeenCalledTimes(2);

      // Verify publish was called ONLY for @angular/common (pkg2Path)
      expect(publishSpy).toHaveBeenCalledTimes(1);
      expect(publishSpy).toHaveBeenCalledWith(pkg2Path, 'latest', undefined);
      expect(publishSpy).not.toHaveBeenCalledWith(
        pkg1Path,
        jasmine.any(String),
        jasmine.any(String),
      );
    });
  });

  describe('dry-run mode', () => {
    let releaseNotesSpy: jasmine.Spy;
    let builtPackagesDir: string;
    let logInfoSpy: jasmine.Spy;

    beforeEach(() => {
      releaseNotesSpy = spyOn(ReleaseNotes, 'forRange').and.resolveTo({
        getGithubReleaseEntry: async () => 'release notes body',
        getUrlFragmentForRelease: async () => 'url-frag',
      } as any);

      builtPackagesDir = path.join(testTmpDir, 'dist');

      logInfoSpy = spyOn(Log, 'info');
    });

    it('should skip API calls and log dry-run actions', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
          dryRun: true,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      // Verify no external actions were performed
      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
      expect(publishSpy).not.toHaveBeenCalled();

      // Verify dry-run logs
      expect(logInfoSpy).toHaveBeenCalledWith('[Dry-Run] Would tag global tag: v10.1.0');
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[Dry-Run] Would create GitHub Release for tag: v10.1.0',
      );
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[Dry-Run] Would publish package: @angular/core to Wombat',
      );
    });

    it('should skip monorepo tag creation and log dry-run actions', async () => {
      const monorepoReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
        buildPackages: async () => [],
      };
      setConfig({github: githubConfig, release: monorepoReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      const tool = new PublishCiTool(
        {github: githubConfig, release: monorepoReleaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
          dryRun: true,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      // Verify no external actions were performed
      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
      expect(publishSpy).not.toHaveBeenCalled();

      // Verify dry-run logs
      expect(logInfoSpy).toHaveBeenCalledWith('[Dry-Run] Would tag global tag: v10.1.0');
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[Dry-Run] Would create GitHub Release for tag: v10.1.0',
      );
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[Dry-Run] Would tag monorepo package: @angular/core@10.1.0',
      );
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[Dry-Run] Would tag monorepo package: @angular/common@10.1.0',
      );
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[Dry-Run] Would publish package: @angular/core to Wombat',
      );
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[Dry-Run] Would publish package: @angular/common to Wombat',
      );
    });
  });
});
