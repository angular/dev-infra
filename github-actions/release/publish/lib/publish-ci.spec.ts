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
import {
  ExitGateCommand,
  getExitGateArRegistryUrl,
  PUBLIC_NPM_REGISTRY_URL,
} from '../../../../ng-dev/release/versioning/exit-gate.js';
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
  let getRefSpy: jasmine.Spy;
  let getTagSpy: jasmine.Spy;
  let createReleaseSpy: jasmine.Spy;
  let publishSpy: jasmine.Spy;
  let checkVersionExistsSpy: jasmine.Spy;
  let deprecateSpy: jasmine.Spy;
  let getAccessTokenSpy: jasmine.Spy;
  let cleanArSpy: jasmine.Spy;
  let uploadManifestSpy: jasmine.Spy;

  let originalNpmConfigUserconfig: string | undefined;
  let originalCi: string | undefined;
  let originalGithubActions: string | undefined;
  let originalGithubStepSummary: string | undefined;

  beforeEach(() => {
    originalNpmConfigUserconfig = process.env['NPM_CONFIG_USERCONFIG'];
    originalCi = process.env['CI'];
    originalGithubActions = process.env['GITHUB_ACTIONS'];
    originalGithubStepSummary = process.env['GITHUB_STEP_SUMMARY'];
    delete process.env['NPM_CONFIG_USERCONFIG'];
    delete process.env['CI'];
    delete process.env['GITHUB_ACTIONS'];
    delete process.env['GITHUB_STEP_SUMMARY'];

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
      exitGate: {projectName: 'angular'},
    };
    setConfig({github: githubConfig, release: releaseConfig});
    gitClient = getMockGitClient(githubConfig, true);
    installSandboxGitClient(gitClient);

    // Populate NPM package info cache to avoid real fetch calls
    fakeNpmPackageQueryRequest('@angular/core', {});
    fakeNpmPackageQueryRequest('@angular/common', {});

    // Mock NpmCommand and ExitGateCommand methods
    publishSpy = spyOn(NpmCommand, 'publish').and.resolveTo();
    checkVersionExistsSpy = spyOn(NpmCommand, 'checkVersionExists').and.resolveTo(false);
    deprecateSpy = spyOn(NpmCommand, 'deprecate').and.resolveTo();
    getAccessTokenSpy = spyOn(ExitGateCommand, 'getAccessToken').and.resolveTo('mock-access-token');
    cleanArSpy = spyOn(ExitGateCommand, 'cleanArtifactRegistryPackages').and.resolveTo([]);
    uploadManifestSpy = spyOn(ExitGateCommand, 'uploadManifest').and.callFake(
      async (_localPath: string, proj: string, file: string) =>
        `gs://oss-exit-gate-prod-projects-bucket/${proj}/npm/manifests/${file}`,
    );

    // Mock GitHub API calls using a plain mock object to avoid Proxy issues
    createRefSpy = jasmine.createSpy('createRef').and.resolveTo({});
    getRefSpy = jasmine.createSpy('getRef').and.resolveTo({});
    getTagSpy = jasmine.createSpy('getTag').and.resolveTo({});
    createReleaseSpy = jasmine.createSpy('createRelease').and.resolveTo({});
    const mockGithub = {
      git: {
        createRef: createRefSpy,
        getRef: getRefSpy,
        getTag: getTagSpy,
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

  afterEach(() => {
    if (originalNpmConfigUserconfig !== undefined) {
      process.env['NPM_CONFIG_USERCONFIG'] = originalNpmConfigUserconfig;
    } else {
      delete process.env['NPM_CONFIG_USERCONFIG'];
    }
    if (originalCi !== undefined) {
      process.env['CI'] = originalCi;
    } else {
      delete process.env['CI'];
    }
    if (originalGithubActions !== undefined) {
      process.env['GITHUB_ACTIONS'] = originalGithubActions;
    } else {
      delete process.env['GITHUB_ACTIONS'];
    }
    if (originalGithubStepSummary !== undefined) {
      process.env['GITHUB_STEP_SUMMARY'] = originalGithubStepSummary;
    } else {
      delete process.env['GITHUB_STEP_SUMMARY'];
    }
  });

  it('should verify HEAD SHA matches expectedSha', async () => {
    // Write package.json v10.0.0
    fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
    SandboxGitRepo.withInitialCommit(githubConfig);

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
    spyOn(ReleaseNotes, 'forRange').and.resolveTo({
      getGithubReleaseEntry: async () => 'release notes body',
      getUrlFragmentForRelease: async () => 'url-frag',
    } as any);

    // Prepare dummy built package output
    const builtPackagesDir = path.join(testTmpDir, 'dist');
    mockTgzPackage(builtPackagesDir, '@angular/core', '10.0.0');

    await expectAsync(toolWithCorrectSha.run()).toBeResolved();
  });

  describe('fail-fast validation', () => {
    it('should throw if exitGateProject is missing (dryRun: false) and not call GitHub API', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const configWithoutExitGate: ReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}],
        buildPackages: async () => [],
      };

      const tool = new PublishCiTool(
        {github: githubConfig, release: configWithoutExitGate} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir: path.join(testTmpDir, 'dist'),
          expectedSha: headSha,
          dryRun: false,
        },
      );

      await expectAsync(tool.run()).toBeRejectedWithError(
        'OSS Exit Gate project name is not defined. Configure `release.exitGate.projectName` or pass `exitGateProject`.',
      );

      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
    });

    it('should NOT throw if exitGateProject is missing when dryRun is true', async () => {
      spyOn(ReleaseNotes, 'forRange').and.resolveTo({
        getGithubReleaseEntry: async () => 'release notes body',
        getUrlFragmentForRelease: async () => 'url-frag',
      } as any);

      const builtPackagesDir = path.join(testTmpDir, 'dist');
      mockTgzPackage(builtPackagesDir, '@angular/core', '10.0.0');

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const configWithoutExitGate: ReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}],
        buildPackages: async () => [],
      };

      const tool = new PublishCiTool(
        {github: githubConfig, release: configWithoutExitGate} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
          dryRun: true,
        },
      );

      await expectAsync(tool.run()).toBeResolved();
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
      expect(uploadManifestSpy).not.toHaveBeenCalled();
    });

    it('should throw if exitGateProject is invalid even when dryRun is true and not call GitHub API', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      for (const invalidProject of ['../evil', 'INVALID', 'proj\nnewline']) {
        const tool = new PublishCiTool(
          {github: githubConfig, release: releaseConfig} as any,
          gitClient,
          testTmpDir,
          {
            builtPackagesDir: path.join(testTmpDir, 'dist'),
            expectedSha: headSha,
            exitGateProject: invalidProject,
            dryRun: true,
          },
        );

        await expectAsync(tool.run()).toBeRejectedWithError(/Invalid OSS Exit Gate project name/);
      }

      const configWithInvalidExitGate: ReleaseConfig = {
        ...releaseConfig,
        exitGate: {projectName: '../evil'},
      };
      const toolFromConfig = new PublishCiTool(
        {github: githubConfig, release: configWithInvalidExitGate} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir: path.join(testTmpDir, 'dist'),
          expectedSha: headSha,
          dryRun: true,
        },
      );
      await expectAsync(toolFromConfig.run()).toBeRejectedWithError(
        /Invalid OSS Exit Gate project name/,
      );

      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
    });

    it('should throw if useApplicationDefaultCredentials is enabled when CI is set', async () => {
      process.env['CI'] = 'true';

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir: path.join(testTmpDir, 'dist'),
          expectedSha: headSha,
          useApplicationDefaultCredentials: true,
        },
      );

      await expectAsync(tool.run()).toBeRejectedWithError(
        'useApplicationDefaultCredentials cannot be used in a CI environment.',
      );

      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
    });

    it('should throw if useApplicationDefaultCredentials is enabled when GITHUB_ACTIONS is set', async () => {
      process.env['GITHUB_ACTIONS'] = 'true';

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir: path.join(testTmpDir, 'dist'),
          expectedSha: headSha,
          useApplicationDefaultCredentials: true,
        },
      );

      await expectAsync(tool.run()).toBeRejectedWithError(
        'useApplicationDefaultCredentials cannot be used in a CI environment.',
      );

      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
    });

    it('should throw if built packages directory does not exist and not call GitHub API', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      SandboxGitRepo.withInitialCommit(githubConfig);
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
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      SandboxGitRepo.withInitialCommit(githubConfig);
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

    it('should throw if a built package .tgz path is a symlink and not call GitHub API', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const builtPackagesDir = path.join(testTmpDir, 'dist');
      fs.mkdirSync(builtPackagesDir, {recursive: true});

      const targetFile = path.join(testTmpDir, 'outside-target.tgz');
      fs.writeFileSync(targetFile, 'dummy-tgz-content');

      const symlinkTgzPath = path.join(builtPackagesDir, 'angular-core-10.0.0.tgz');
      fs.symlinkSync(targetFile, symlinkTgzPath);

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
        `Built package path is not a regular file: ${symlinkTgzPath}`,
      );

      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
    });

    it('should throw if a built package path escapes builtPackagesDir and not call GitHub API', async () => {
      fs.writeFileSync(
        path.join(testTmpDir, 'package.json'),
        JSON.stringify({version: '10.0.0/../../escaped'}),
      );
      SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const builtPackagesDir = path.join(testTmpDir, 'dist');
      fs.mkdirSync(builtPackagesDir, {recursive: true});

      const escapedTgzPath = path.join(testTmpDir, 'escaped.tgz');
      fs.writeFileSync(escapedTgzPath, 'dummy-tgz-content');

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
        /Built package path escapes builtPackagesDir:.*escaped\.tgz/,
      );

      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
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
    let builtPackagesDir: string;

    beforeEach(() => {
      spyOn(ReleaseNotes, 'forRange').and.resolveTo({
        getGithubReleaseEntry: async () => 'release notes body',
        getUrlFragmentForRelease: async () => 'url-frag',
      } as any);

      builtPackagesDir = path.join(testTmpDir, 'dist');
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

    it('should proceed to publish if existing tag or release matches expectedSha on HTTP 422', async () => {
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
      getRefSpy.and.resolveTo({data: {object: {sha: headSha}}});

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

      expect(getRefSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          ref: 'tags/v10.1.0-next.1',
        }),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        jasmine.stringMatching('Tag v10.1.0-next.1 already exists, skipping tag creation.'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(
          'GitHub release for v10.1.0-next.1 already exists, skipping release creation.',
        ),
      );
      expect(publishSpy).toHaveBeenCalled();
      expect(uploadManifestSpy).toHaveBeenCalled();
    });

    it('should dereference annotated tags via git.getTag when verifying existing tag on HTTP 422', async () => {
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
      getRefSpy.and.resolveTo({data: {object: {type: 'tag', sha: 'annotated-tag-object-sha'}}});
      getTagSpy.and.resolveTo({data: {object: {sha: headSha}}});

      spyOn(Log, 'warn');

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

      expect(getTagSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          tag_sha: 'annotated-tag-object-sha',
        }),
      );
      expect(publishSpy).toHaveBeenCalled();
      expect(uploadManifestSpy).toHaveBeenCalled();
    });

    it('should fail and abort publishing if existing tag points to a different SHA on HTTP 422', async () => {
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
      getRefSpy.and.resolveTo({data: {object: {sha: 'tampered-sha-99999'}}});

      spyOn(Log, 'error');

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
        new RegExp(
          `Existing tag v10\\.1\\.0-next\\.1 points to tampered-sha-99999, which does not match expected SHA ${headSha}`,
        ),
      );
      expect(publishSpy).not.toHaveBeenCalled();
      expect(uploadManifestSpy).not.toHaveBeenCalled();
    });

    it('should fail and abort publishing if existing release tag points to a different SHA on HTTP 422', async () => {
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

      createReleaseSpy.and.rejectWith(new RequestError('Release already exists', 422));
      getRefSpy.and.resolveTo({data: {object: {sha: 'tampered-sha-99999'}}});

      spyOn(Log, 'error');

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
        new RegExp(
          `GitHub Release "v10\\.1\\.0-next\\.1" failed to create: Existing tag v10\\.1\\.0-next\\.1 points to tampered-sha-99999`,
        ),
      );
      expect(publishSpy).not.toHaveBeenCalled();
      expect(uploadManifestSpy).not.toHaveBeenCalled();
    });

    it('should fail and abort publishing if getRef fails when verifying an existing tag on HTTP 422', async () => {
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
      getRefSpy.and.rejectWith(new Error('GitHub API error during getRef'));

      spyOn(Log, 'error');

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
        /Failed to verify existing tag v10\.1\.0-next\.1: Error: GitHub API error during getRef/,
      );
      expect(publishSpy).not.toHaveBeenCalled();
      expect(uploadManifestSpy).not.toHaveBeenCalled();
    });
  });

  it('should create monorepo tags if there are multiple npm packages configured', async () => {
    const monorepoReleaseConfig: ReleaseConfig = {
      representativeNpmPackage: '@angular/core',
      npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
      buildPackages: async () => [],
      exitGate: {projectName: 'angular'},
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

  describe('OSS Exit Gate publishing & Artifact Registry setup', () => {
    let releaseNotesSpy: jasmine.Spy;
    let builtPackagesDir: string;
    let npmrcPath: string;

    beforeEach(() => {
      releaseNotesSpy = spyOn(ReleaseNotes, 'forRange').and.resolveTo({
        getGithubReleaseEntry: async () => 'release notes body',
        getUrlFragmentForRelease: async () => 'url-frag',
      } as any);

      builtPackagesDir = path.join(testTmpDir, 'dist');
      npmrcPath = path.join(testTmpDir, '.npmrc');
    });

    it('should query public npmjs.org with empty.npmrc without mutating global NPM_CONFIG_USERCONFIG', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');

      const originalUserconfig = 'original-userconfig-path';
      process.env['NPM_CONFIG_USERCONFIG'] = originalUserconfig;

      let checkRegistryUrl: string | undefined;
      let checkCwd: string | undefined;
      let checkEnvUserconfig: string | undefined;
      let emptyNpmrcExistsDuringCheck: boolean | undefined;
      let globalUserconfigDuringCheck: string | undefined;

      checkVersionExistsSpy.and.callFake(
        async (
          _name: string,
          _version: string,
          registryUrl: string | undefined,
          cwd: string | undefined,
          env: NodeJS.ProcessEnv | undefined,
        ) => {
          checkRegistryUrl = registryUrl;
          checkCwd = cwd;
          checkEnvUserconfig = env?.['NPM_CONFIG_USERCONFIG'];
          emptyNpmrcExistsDuringCheck =
            checkEnvUserconfig !== undefined && fs.existsSync(checkEnvUserconfig);
          globalUserconfigDuringCheck = process.env['NPM_CONFIG_USERCONFIG'];
          return false;
        },
      );

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

      expect(checkRegistryUrl).toBe(PUBLIC_NPM_REGISTRY_URL);
      expect(checkRegistryUrl).toBe('https://registry.npmjs.org/');
      expect(checkCwd).toBeDefined();
      expect(checkCwd).toMatch(/angular-publish-ci-/);
      expect(checkEnvUserconfig).toBe(path.join(checkCwd!, 'empty.npmrc'));
      expect(emptyNpmrcExistsDuringCheck).toBe(true);
      expect(globalUserconfigDuringCheck).toBe(originalUserconfig);
      expect(process.env['NPM_CONFIG_USERCONFIG']).toBe(originalUserconfig);
      expect(fs.existsSync(checkEnvUserconfig!)).toBe(false);
    });

    it('should stage packages to Artifact Registry with isolated ar.npmrc, clean AR before publish, and clean up tempDir', async () => {
      const testReleaseConfig: ReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
        buildPackages: async () => [],
        exitGate: {projectName: 'angular'},
      };
      setConfig({github: githubConfig, release: testReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const pkg1Path = mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      const pkg2Path = mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      const originalNpmrcContent = 'registry=https://my-custom-registry.com/\n';
      fs.writeFileSync(npmrcPath, originalNpmrcContent);

      const originalUserconfig = 'original-userconfig-path';
      process.env['NPM_CONFIG_USERCONFIG'] = originalUserconfig;

      const callOrder: string[] = [];
      getAccessTokenSpy.and.callFake(async () => {
        callOrder.push('getAccessToken');
        return 'mock-access-token';
      });
      cleanArSpy.and.callFake(async () => {
        callOrder.push('cleanAr');
        return [];
      });

      let arNpmrcPath: string | undefined;
      let arNpmrcContent: string | null = null;
      let arNpmrcMode: number | undefined;
      let globalUserconfigDuringPublish: string | undefined;
      let globalTokenDuringPublish: string | undefined;
      publishSpy.and.callFake(
        async (
          _pkgPath: string,
          _distTag: string,
          _registryUrl: string | undefined,
          _cwd: string | undefined,
          env: NodeJS.ProcessEnv | undefined,
        ) => {
          callOrder.push('publish');
          globalUserconfigDuringPublish = process.env['NPM_CONFIG_USERCONFIG'];
          globalTokenDuringPublish = process.env['EXIT_GATE_AR_TOKEN'];
          arNpmrcPath = env?.['NPM_CONFIG_USERCONFIG'];
          if (arNpmrcPath && fs.existsSync(arNpmrcPath)) {
            arNpmrcContent = fs.readFileSync(arNpmrcPath, 'utf8');
            arNpmrcMode = fs.statSync(arNpmrcPath).mode & 0o777;
          }
        },
      );
      uploadManifestSpy.and.callFake(async (_localPath: string, proj: string, file: string) => {
        callOrder.push('uploadManifest');
        return `gs://oss-exit-gate-prod-projects-bucket/${proj}/npm/manifests/${file}`;
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

      // Verify cleanArtifactRegistryPackages ran before NpmCommand.publish and uploadManifest ran last
      // without {accessToken} options in default CI mode
      expect(cleanArSpy).toHaveBeenCalledOnceWith('angular');
      expect(uploadManifestSpy).toHaveBeenCalledOnceWith(
        jasmine.stringMatching(/angular-publish-ci-/),
        'angular',
        jasmine.stringMatching(/^manifest-10\.1\.0-/),
      );
      expect(callOrder).toEqual([
        'getAccessToken',
        'cleanAr',
        'publish',
        'publish',
        'uploadManifest',
      ]);

      // Verify isolated ar.npmrc content, permissions, and absence of raw token on disk
      const expectedArRegistryUrl = getExitGateArRegistryUrl('angular');
      expect(arNpmrcPath).toBeDefined();
      expect(path.basename(arNpmrcPath!)).toBe('ar.npmrc');
      expect(path.dirname(arNpmrcPath!)).toMatch(/angular-publish-ci-/);
      expect<string | null>(arNpmrcContent).toContain(`registry=${expectedArRegistryUrl}`);
      expect<string | null>(arNpmrcContent).toContain(
        '//us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/:_authToken=${EXIT_GATE_AR_TOKEN}',
      );
      expect<string | null>(arNpmrcContent).toContain('provenance=false');
      expect<string | null>(arNpmrcContent).not.toContain('mock-access-token');
      if (process.platform !== 'win32') {
        expect(arNpmrcMode).toBe(0o600);
      }

      // Verify temp ar.npmrc and tempDir were cleaned up in finally
      expect(fs.existsSync(arNpmrcPath!)).toBe(false);
      expect(fs.existsSync(path.dirname(arNpmrcPath!))).toBe(false);

      // Verify project .npmrc and global process.env were untouched
      expect(fs.existsSync(npmrcPath)).toBe(true);
      expect(fs.readFileSync(npmrcPath, 'utf8')).toBe(originalNpmrcContent);
      expect(globalUserconfigDuringPublish).toBe(originalUserconfig);
      expect(globalTokenDuringPublish).toBeUndefined();
      expect(process.env['NPM_CONFIG_USERCONFIG']).toBe(originalUserconfig);
      expect(process.env['EXIT_GATE_AR_TOKEN']).toBeUndefined();

      // Verify NpmCommand.publish arguments and scoped publishEnv
      const expectedTempDir = path.dirname(arNpmrcPath!);
      const expectedEnvMatcher = jasmine.objectContaining({
        NPM_CONFIG_USERCONFIG: arNpmrcPath,
        EXIT_GATE_AR_TOKEN: 'mock-access-token',
      });
      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy.calls.argsFor(0)).toEqual([
        pkg1Path,
        'latest',
        expectedArRegistryUrl,
        expectedTempDir,
        expectedEnvMatcher,
      ]);
      expect(publishSpy.calls.argsFor(1)).toEqual([
        pkg2Path,
        'latest',
        expectedArRegistryUrl,
        expectedTempDir,
        expectedEnvMatcher,
      ]);
    });

    it('should isolate npm commands in tempDir and resolve relative package paths', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const pkgPath = mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      const relativeBuiltPackagesDir = path.relative(process.cwd(), builtPackagesDir);

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir: relativeBuiltPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      expect(checkVersionExistsSpy).toHaveBeenCalledWith(
        '@angular/core',
        '10.1.0',
        PUBLIC_NPM_REGISTRY_URL,
        jasmine.stringMatching(/angular-publish-ci-/),
        jasmine.objectContaining({
          NPM_CONFIG_USERCONFIG: jasmine.stringMatching(/empty\.npmrc$/),
        }),
      );
      expect(publishSpy).toHaveBeenCalledWith(
        pkgPath,
        'latest',
        getExitGateArRegistryUrl('angular'),
        jasmine.stringMatching(/angular-publish-ci-/),
        jasmine.objectContaining({
          NPM_CONFIG_USERCONFIG: jasmine.stringMatching(/ar\.npmrc$/),
          EXIT_GATE_AR_TOKEN: 'mock-access-token',
        }),
      );
    });

    it('should clean up tempDir and leave project .npmrc and global env untouched when staging fails', async () => {
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

      let arNpmrcPath: string | undefined;
      publishSpy.and.callFake(
        async (
          _pkgPath: string,
          _distTag: string,
          _registryUrl: string | undefined,
          _cwd: string | undefined,
          env: NodeJS.ProcessEnv | undefined,
        ) => {
          arNpmrcPath = env?.['NPM_CONFIG_USERCONFIG'];
          throw new Error('Npm publish error');
        },
      );

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
        /Publish failed with the following errors:\nPackage "@angular\/core@10\.1\.0" failed to publish: Error: Npm publish error/,
      );

      // Verify temp ar.npmrc and tempDir were cleaned up even on failure
      expect(arNpmrcPath).toBeDefined();
      expect(fs.existsSync(arNpmrcPath!)).toBe(false);
      expect(fs.existsSync(path.dirname(arNpmrcPath!))).toBe(false);

      // Verify manifest upload was skipped
      expect(uploadManifestSpy).not.toHaveBeenCalled();

      // Verify project .npmrc and global env are untouched
      expect(fs.existsSync(npmrcPath)).toBe(true);
      expect(fs.readFileSync(npmrcPath, 'utf8')).toBe(originalNpmrcContent);
      expect(process.env['NPM_CONFIG_USERCONFIG']).toBe(originalUserconfig);
    });

    it('should upload manifest JSON with tags: ["latest"] for stable release and clean up manifest file', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');

      let capturedLocalPath: string | undefined;
      let capturedProject: string | undefined;
      let capturedFileName: string | undefined;
      let capturedManifestJson: unknown;
      uploadManifestSpy.and.callFake(async (localPath: string, proj: string, file: string) => {
        capturedLocalPath = localPath;
        capturedProject = proj;
        capturedFileName = file;
        capturedManifestJson = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        return `gs://oss-exit-gate-prod-projects-bucket/${proj}/npm/manifests/${file}`;
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

      expect(uploadManifestSpy).toHaveBeenCalledTimes(1);
      expect(capturedProject).toBe('angular');
      expect(capturedLocalPath).toBeDefined();
      expect(path.dirname(capturedLocalPath!)).toMatch(/angular-publish-ci-/);
      expect(path.basename(capturedLocalPath!)).toBe(capturedFileName!);
      expect(capturedManifestJson).toEqual({
        publish_all: true,
        registry_config: {
          npm: {
            tags: ['latest'],
          },
        },
      });
      expect(fs.existsSync(capturedLocalPath!)).toBe(false);
      expect(fs.existsSync(path.dirname(capturedLocalPath!))).toBe(false);
    });

    it('should upload manifest JSON with tags: ["next"] for prerelease', async () => {
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

      let capturedManifestJson: unknown;
      uploadManifestSpy.and.callFake(async (localPath: string, proj: string, file: string) => {
        capturedManifestJson = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        return `gs://oss-exit-gate-prod-projects-bucket/${proj}/npm/manifests/${file}`;
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

      expect(uploadManifestSpy).toHaveBeenCalledTimes(1);
      expect(capturedManifestJson).toEqual({
        publish_all: true,
        registry_config: {
          npm: {
            tags: ['next'],
          },
        },
      });
    });

    it('should upload manifest JSON with LTS dist tag for LTS release', async () => {
      fakeNpmPackageQueryRequest('@angular/core', {
        'dist-tags': {'v9-lts': '9.1.0'},
        time: {'9.0.0': new Date().toISOString()},
      });

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '9.1.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '9.1.1'}));
      sandbox.commit('v9.1.1 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '9.1.1');

      let capturedManifestJson: unknown;
      uploadManifestSpy.and.callFake(async (localPath: string, proj: string, file: string) => {
        capturedManifestJson = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        return `gs://oss-exit-gate-prod-projects-bucket/${proj}/npm/manifests/${file}`;
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

      expect(uploadManifestSpy).toHaveBeenCalledTimes(1);
      expect(capturedManifestJson).toEqual({
        publish_all: true,
        registry_config: {
          npm: {
            tags: ['v9-lts'],
          },
        },
      });
    });

    it('should skip AR auth, cleanup, publish, and manifest upload when all packages are already published', async () => {
      const testReleaseConfig: ReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
        buildPackages: async () => [],
        exitGate: {projectName: 'angular'},
      };
      setConfig({github: githubConfig, release: testReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      checkVersionExistsSpy.and.resolveTo(true);

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

      expect(checkVersionExistsSpy).toHaveBeenCalledTimes(2);
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
      expect(cleanArSpy).not.toHaveBeenCalled();
      expect(publishSpy).not.toHaveBeenCalled();
      expect(uploadManifestSpy).not.toHaveBeenCalled();
    });

    it('should skip already published packages and stage & upload manifest for remaining packages', async () => {
      const testReleaseConfig: ReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
        buildPackages: async () => [],
        exitGate: {projectName: 'angular'},
      };
      setConfig({github: githubConfig, release: testReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const pkg1Path = mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      const pkg2Path = mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      checkVersionExistsSpy.and.callFake(async (name: string) => name === '@angular/core');

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

      expect(checkVersionExistsSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy).toHaveBeenCalledTimes(1);
      expect(publishSpy).toHaveBeenCalledWith(
        pkg2Path,
        'latest',
        getExitGateArRegistryUrl('angular'),
        jasmine.stringMatching(/angular-publish-ci-/),
        jasmine.objectContaining({
          NPM_CONFIG_USERCONFIG: jasmine.stringMatching(/ar\.npmrc$/),
          EXIT_GATE_AR_TOKEN: 'mock-access-token',
        }),
      );
      expect(publishSpy).not.toHaveBeenCalledWith(
        pkg1Path,
        jasmine.any(String),
        jasmine.any(String),
        jasmine.any(String),
        jasmine.anything(),
      );
      expect(uploadManifestSpy).toHaveBeenCalledTimes(1);
    });

    it('should skip AR auth, cleanup, publish, and manifest upload if any version check fails', async () => {
      const testReleaseConfig: ReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
        buildPackages: async () => [],
        exitGate: {projectName: 'angular'},
      };
      setConfig({github: githubConfig, release: testReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      checkVersionExistsSpy.and.callFake(async (name: string) => {
        if (name === '@angular/common') {
          throw new Error('Registry timeout');
        }
        return false;
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

      await expectAsync(tool.run()).toBeRejectedWithError(/Registry timeout/);
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
      expect(cleanArSpy).not.toHaveBeenCalled();
      expect(publishSpy).not.toHaveBeenCalled();
      expect(uploadManifestSpy).not.toHaveBeenCalled();
    });

    it('should skip manifest upload and reject when any package fails to stage to Artifact Registry', async () => {
      const testReleaseConfig: ReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
        buildPackages: async () => [],
        exitGate: {projectName: 'angular'},
      };
      setConfig({github: githubConfig, release: testReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      const pkg2Path = mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      publishSpy.and.callFake(async (pkgPath: string) => {
        if (pkgPath === pkg2Path) {
          throw new Error('Artifact Registry staging failed');
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

      await expectAsync(tool.run()).toBeRejectedWithError(
        /Package "@angular\/common@10\.1\.0" failed to publish: Error: Artifact Registry staging failed/,
      );
      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(uploadManifestSpy).not.toHaveBeenCalled();
    });

    it('should reject and include OSS Exit Gate failure when uploadManifest rejects', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');

      let capturedManifestPath: string | undefined;
      uploadManifestSpy.and.callFake(async (localPath: string) => {
        capturedManifestPath = localPath;
        throw new Error('GCS upload 403 forbidden');
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

      await expectAsync(tool.run()).toBeRejectedWithError(
        /OSS Exit Gate trigger for project "angular" failed: Error: GCS upload 403 forbidden/,
      );
      expect(capturedManifestPath).toBeDefined();
      expect(fs.existsSync(capturedManifestPath!)).toBe(false);
      expect(fs.existsSync(path.dirname(capturedManifestPath!))).toBe(false);
    });

    it('should forward useApplicationDefault, maskSecret, and accessToken to ExitGateCommand when useApplicationDefaultCredentials is true', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');

      const maskSecretSpy = jasmine.createSpy('maskSecret');

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
          useApplicationDefaultCredentials: true,
          maskSecret: maskSecretSpy,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      expect(getAccessTokenSpy).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          useApplicationDefault: true,
          maskSecret: maskSecretSpy,
        }),
      );
      expect(cleanArSpy).toHaveBeenCalledOnceWith('angular', {
        accessToken: 'mock-access-token',
      });
      expect(uploadManifestSpy).toHaveBeenCalledOnceWith(
        jasmine.any(String),
        'angular',
        jasmine.any(String),
        {accessToken: 'mock-access-token'},
      );
    });

    it('should log warning with manual npm deprecate command and NOT call NpmCommand.deprecate', async () => {
      const deprecateReleaseConfig: ReleaseConfig = {
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
        exitGate: {projectName: 'angular'},
      };
      setConfig({github: githubConfig, release: deprecateReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      const summaryFilePath = path.join(testTmpDir, 'step-summary.md');
      process.env['GITHUB_STEP_SUMMARY'] = summaryFilePath;
      const warnSpy = spyOn(Log, 'warn');

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

      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(deprecateSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /npm deprecate "@angular\/common@>=9\.0\.0" "Use @angular\/core instead"/,
        ),
      );
      const summaryMarkdown = fs.readFileSync(summaryFilePath, 'utf8');
      expect(summaryMarkdown).toContain('### Warnings / Manual Follow-ups');
      expect(summaryMarkdown).toContain(
        'npm deprecate "@angular/common@>=9.0.0" "Use @angular/core instead"',
      );
    });

    it('should NOT emit manual deprecation warnings when uploadManifest rejects', async () => {
      const deprecateReleaseConfig: ReleaseConfig = {
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
        exitGate: {projectName: 'angular'},
      };
      setConfig({github: githubConfig, release: deprecateReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      uploadManifestSpy.and.rejectWith(new Error('GCS upload 403 forbidden'));

      const summaryFilePath = path.join(testTmpDir, 'step-summary.md');
      process.env['GITHUB_STEP_SUMMARY'] = summaryFilePath;
      const warnSpy = spyOn(Log, 'warn');

      const tool = new PublishCiTool(
        {github: githubConfig, release: deprecateReleaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeRejectedWithError(
        /OSS Exit Gate trigger for project "angular" failed: Error: GCS upload 403 forbidden/,
      );

      expect(deprecateSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalledWith(
        jasmine.stringMatching(/npm deprecate|Skipping deprecation/),
      );
      const summaryMarkdown = fs.readFileSync(summaryFilePath, 'utf8');
      expect(summaryMarkdown).not.toContain('### Warnings / Manual Follow-ups');
      expect(summaryMarkdown).not.toContain('npm deprecate');
    });

    it('should NOT emit manual deprecation warnings when another package fails staging', async () => {
      const deprecateReleaseConfig: ReleaseConfig = {
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
        exitGate: {projectName: 'angular'},
      };
      setConfig({github: githubConfig, release: deprecateReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      const pkg1Path = mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      publishSpy.and.callFake(async (pkgPath: string) => {
        if (pkgPath === pkg1Path) {
          throw new Error('Artifact Registry staging failed for core');
        }
      });

      const summaryFilePath = path.join(testTmpDir, 'step-summary.md');
      process.env['GITHUB_STEP_SUMMARY'] = summaryFilePath;
      const warnSpy = spyOn(Log, 'warn');

      const tool = new PublishCiTool(
        {github: githubConfig, release: deprecateReleaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
        },
      );

      await expectAsync(tool.run()).toBeRejectedWithError(
        /Package "@angular\/core@10\.1\.0" failed to publish: Error: Artifact Registry staging failed for core/,
      );

      expect(uploadManifestSpy).not.toHaveBeenCalled();
      expect(deprecateSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalledWith(
        jasmine.stringMatching(/npm deprecate|Skipping deprecation/),
      );
      const summaryMarkdown = fs.readFileSync(summaryFilePath, 'utf8');
      expect(summaryMarkdown).not.toContain('### Warnings / Manual Follow-ups');
      expect(summaryMarkdown).not.toContain('npm deprecate');
    });

    it('should skip GitHub tagging and release when skipTagging is true and run Exit Gate publishing directly', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      SandboxGitRepo.withInitialCommit(githubConfig);
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
          skipTagging: true,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      expect(releaseNotesSpy).not.toHaveBeenCalled();
      expect(createRefSpy).not.toHaveBeenCalled();
      expect(createReleaseSpy).not.toHaveBeenCalled();
      expect(checkVersionExistsSpy).toHaveBeenCalledTimes(1);
      expect(getAccessTokenSpy).toHaveBeenCalledTimes(1);
      expect(cleanArSpy).toHaveBeenCalledOnceWith('angular');
      expect(publishSpy).toHaveBeenCalledTimes(1);
      expect(uploadManifestSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow exitGateProject option to override config.release.exitGate.projectName', async () => {
      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');

      let arNpmrcContent: string | null = null;
      publishSpy.and.callFake(
        async (
          _pkgPath: string,
          _distTag: string,
          _registryUrl: string | undefined,
          _cwd: string | undefined,
          env: NodeJS.ProcessEnv | undefined,
        ) => {
          const arNpmrcPath = env?.['NPM_CONFIG_USERCONFIG'];
          if (arNpmrcPath && fs.existsSync(arNpmrcPath)) {
            arNpmrcContent = fs.readFileSync(arNpmrcPath, 'utf8');
          }
        },
      );

      const tool = new PublishCiTool(
        {github: githubConfig, release: releaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
          exitGateProject: 'angular-override',
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      const expectedOverrideRegistryUrl = getExitGateArRegistryUrl('angular-override');
      expect(cleanArSpy).toHaveBeenCalledOnceWith('angular-override');
      expect(publishSpy).toHaveBeenCalledWith(
        jasmine.any(String),
        'latest',
        expectedOverrideRegistryUrl,
        jasmine.stringMatching(/angular-publish-ci-/),
        jasmine.objectContaining({
          NPM_CONFIG_USERCONFIG: jasmine.stringMatching(/ar\.npmrc$/),
          EXIT_GATE_AR_TOKEN: 'mock-access-token',
        }),
      );
      expect<string | null>(arNpmrcContent).toContain(`registry=${expectedOverrideRegistryUrl}`);
      expect(uploadManifestSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/angular-publish-ci-/),
        'angular-override',
        jasmine.stringMatching(/^manifest-10\.1\.0-/),
      );
    });
  });

  describe('dry-run mode', () => {
    let builtPackagesDir: string;
    let logInfoSpy: jasmine.Spy;
    let logWarnSpy: jasmine.Spy;

    beforeEach(() => {
      spyOn(ReleaseNotes, 'forRange').and.resolveTo({
        getGithubReleaseEntry: async () => 'release notes body',
        getUrlFragmentForRelease: async () => 'url-frag',
      } as any);

      builtPackagesDir = path.join(testTmpDir, 'dist');

      logInfoSpy = spyOn(Log, 'info');
      logWarnSpy = spyOn(Log, 'warn');
    });

    it('should skip API calls and log dry-run Exit Gate actions', async () => {
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
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
      expect(cleanArSpy).not.toHaveBeenCalled();
      expect(checkVersionExistsSpy).not.toHaveBeenCalled();
      expect(publishSpy).not.toHaveBeenCalled();
      expect(deprecateSpy).not.toHaveBeenCalled();
      expect(uploadManifestSpy).not.toHaveBeenCalled();

      // Verify dry-run logs
      expect(logInfoSpy).toHaveBeenCalledWith('[Dry-Run] Would tag global tag: v10.1.0');
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[Dry-Run] Would create GitHub Release for tag: v10.1.0',
      );
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[Dry-Run] Would stage package: @angular/core@10.1.0 to Artifact Registry (https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/)',
      );
      expect(logInfoSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /^\[Dry-Run\] Would upload OSS Exit Gate manifest to gs:\/\/oss-exit-gate-prod-projects-bucket\/angular\/npm\/manifests\//,
        ),
      );
    });

    it('should skip monorepo tag creation and log dry-run Exit Gate actions', async () => {
      const monorepoReleaseConfig: ReleaseConfig = {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}, {name: '@angular/common'}],
        buildPackages: async () => [],
        exitGate: {projectName: 'angular'},
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
      expect(getAccessTokenSpy).not.toHaveBeenCalled();
      expect(cleanArSpy).not.toHaveBeenCalled();
      expect(checkVersionExistsSpy).not.toHaveBeenCalled();
      expect(publishSpy).not.toHaveBeenCalled();
      expect(deprecateSpy).not.toHaveBeenCalled();
      expect(uploadManifestSpy).not.toHaveBeenCalled();

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
        '[Dry-Run] Would stage package: @angular/core@10.1.0 to Artifact Registry (https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/)',
      );
      expect(logInfoSpy).toHaveBeenCalledWith(
        '[Dry-Run] Would stage package: @angular/common@10.1.0 to Artifact Registry (https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/)',
      );
      expect(logInfoSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /^\[Dry-Run\] Would upload OSS Exit Gate manifest to gs:\/\/oss-exit-gate-prod-projects-bucket\/angular\/npm\/manifests\//,
        ),
      );
    });

    it('should log dry-run deprecation warning and not call NpmCommand.deprecate', async () => {
      const deprecateReleaseConfig: ReleaseConfig = {
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
        exitGate: {projectName: 'angular'},
      };
      setConfig({github: githubConfig, release: deprecateReleaseConfig});

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.0.0'}));
      const sandbox = SandboxGitRepo.withInitialCommit(githubConfig);

      fs.writeFileSync(path.join(testTmpDir, 'package.json'), JSON.stringify({version: '10.1.0'}));
      sandbox.commit('v10.1.0 commit');
      const headSha = gitClient.run(['rev-parse', 'HEAD']).stdout.trim();

      mockTgzPackage(builtPackagesDir, '@angular/core', '10.1.0');
      mockTgzPackage(builtPackagesDir, '@angular/common', '10.1.0');

      const tool = new PublishCiTool(
        {github: githubConfig, release: deprecateReleaseConfig} as any,
        gitClient,
        testTmpDir,
        {
          builtPackagesDir,
          expectedSha: headSha,
          dryRun: true,
        },
      );

      await expectAsync(tool.run()).toBeResolved();

      expect(deprecateSpy).not.toHaveBeenCalled();
      expect(logWarnSpy).toHaveBeenCalledWith(
        '[Dry-Run] Skipping deprecation for @angular/common@>=9.0.0 (unsupported by OSS Exit Gate; manual deprecation required after publish).',
      );
    });
  });
});
