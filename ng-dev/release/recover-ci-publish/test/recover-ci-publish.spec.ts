/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {ReleaseRecoverCiPublishTool} from '../recover-ci-publish.js';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {ChildProcess} from '../../../utils/child-process.js';
import {NpmCommand} from '../../versioning/npm-command.js';
import {PublishCiTool} from '../../../../github-actions/release/publish/lib/publish-ci.js';
import {Prompt} from '../../../utils/prompt.js';
import {Log} from '../../../utils/logging.js';

describe('ReleaseRecoverCiPublishTool', () => {
  let gitClient: any;
  let releaseConfig: any;
  let githubConfig: any;
  let tempDirCreated: string | null = null;

  // Spies
  let getWorkflowRunSpy: jasmine.Spy;
  let listWorkflowRunArtifactsSpy: jasmine.Spy;
  let downloadArtifactSpy: jasmine.Spy;
  let fetchSpy: jasmine.Spy;
  let spawnSpy: jasmine.Spy;
  let publishCiRunSpy: jasmine.Spy;
  let checkIsLoggedInSpy: jasmine.Spy;
  let startInteractiveLoginSpy: jasmine.Spy;
  let promptConfirmSpy: jasmine.Spy;

  beforeEach(() => {
    tempDirCreated = null;
    // Mock fs.mkdtempSync to track the created directory
    const orgMkdtemp = fs.mkdtempSync;
    spyOn(fs, 'mkdtempSync').and.callFake(((prefix: string) => {
      const dir = orgMkdtemp(prefix);
      tempDirCreated = dir;
      return dir;
    }) as any);

    // Mock fs.rmSync to avoid actually deleting if we want to inspect, or just to spy
    spyOn(fs, 'rmSync').and.callThrough();

    // Mock Git Client and Github API
    getWorkflowRunSpy = jasmine.createSpy('getWorkflowRun').and.resolveTo({
      data: {
        name: 'release-run',
        head_sha: 'mock-sha-12345',
      },
    });
    listWorkflowRunArtifactsSpy = jasmine.createSpy('listWorkflowRunArtifacts').and.resolveTo({
      data: {
        artifacts: [
          {name: 'other-artifact', id: 111},
          {name: 'release-packages-tgz', id: 222},
        ],
      },
    });
    downloadArtifactSpy = jasmine.createSpy('downloadArtifact').and.resolveTo({
      data: new ArrayBuffer(8), // Mock zip content
    });

    gitClient = {
      baseDir: '/mock-project-root',
      github: {
        rest: {
          actions: {
            getWorkflowRun: getWorkflowRunSpy,
            listWorkflowRunArtifacts: listWorkflowRunArtifactsSpy,
            downloadArtifact: downloadArtifactSpy,
          },
        },
      },
    };

    releaseConfig = {
      publishRegistry: 'https://registry.npmjs.org',
      npmPackages: [{name: '@angular/core'}],
      representativeNpmPackage: '@angular/core',
    };

    githubConfig = {
      owner: 'angular',
      name: 'angular',
    };

    // Mock global fetch
    fetchSpy = spyOn(global, 'fetch').and.resolveTo({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as any);

    // Mock ChildProcess.spawn (for unzip)
    spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({stdout: '', stderr: ''} as any);

    // Mock NpmCommand static methods
    checkIsLoggedInSpy = spyOn(NpmCommand, 'checkIsLoggedIn').and.resolveTo(true);
    startInteractiveLoginSpy = spyOn(NpmCommand, 'startInteractiveLogin').and.resolveTo();

    // Mock Prompt
    promptConfirmSpy = spyOn(Prompt, 'confirm').and.resolveTo(true);

    // Mock PublishCiTool.prototype.run
    publishCiRunSpy = spyOn(PublishCiTool.prototype, 'run').and.resolveTo();

    // Mock Log to avoid spamming console
    spyOn(Log, 'info');
    spyOn(Log, 'debug');
    spyOn(Log, 'warn');
    spyOn(Log, 'error');
  });

  afterEach(() => {
    // Clean up any leaked temp directories if test failed before cleanup
    if (tempDirCreated && fs.existsSync(tempDirCreated)) {
      try {
        fs.rmSync(tempDirCreated, {recursive: true, force: true});
      } catch {}
    }
  });

  describe('NPM login verification', () => {
    it('should proceed if already logged into NPM', async () => {
      checkIsLoggedInSpy.and.resolveTo(true);

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(checkIsLoggedInSpy).toHaveBeenCalledWith('https://registry.npmjs.org');
      expect(startInteractiveLoginSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).toHaveBeenCalled();
    });

    it('should prompt and login if not logged in and user confirms', async () => {
      checkIsLoggedInSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(true);

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(checkIsLoggedInSpy).toHaveBeenCalled();
      expect(promptConfirmSpy).toHaveBeenCalled();
      expect(startInteractiveLoginSpy).toHaveBeenCalledWith('https://registry.npmjs.org');
      expect(publishCiRunSpy).toHaveBeenCalled();
    });

    it('should abort if not logged in and user declines login', async () => {
      checkIsLoggedInSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(false);

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(checkIsLoggedInSpy).toHaveBeenCalled();
      expect(promptConfirmSpy).toHaveBeenCalled();
      expect(startInteractiveLoginSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
      process.exitCode = undefined; // reset
    });

    it('should force interactive login for Wombat registry without checking login state', async () => {
      releaseConfig.publishRegistry = 'https://wombat-dressing-room.appspot.com/publish';
      checkIsLoggedInSpy.and.resolveTo(true); // Should be ignored

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(checkIsLoggedInSpy).not.toHaveBeenCalled();
      expect(startInteractiveLoginSpy).toHaveBeenCalledWith(
        'https://wombat-dressing-room.appspot.com/publish',
      );
      expect(publishCiRunSpy).toHaveBeenCalled();
    });
  });

  describe('Artifact download and extraction', () => {
    it('should fetch GHA run and list artifacts', async () => {
      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(getWorkflowRunSpy).toHaveBeenCalledWith({
        owner: 'angular',
        repo: 'angular',
        run_id: 12345,
      });
      expect(listWorkflowRunArtifactsSpy).toHaveBeenCalledWith({
        owner: 'angular',
        repo: 'angular',
        run_id: 12345,
      });
    });

    it('should download and extract the correct zip artifact', async () => {
      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      // Verify downloadArtifact called with correct artifact ID (222 for release-packages-tgz)
      expect(downloadArtifactSpy).toHaveBeenCalledWith({
        owner: 'angular',
        repo: 'angular',
        artifact_id: 222,
        archive_format: 'zip',
      });

      // Verify unzip called
      expect(spawnSpy).toHaveBeenCalledTimes(1);
      expect(spawnSpy.calls.first().args[0]).toBe('unzip');
      const unzipArgs = spawnSpy.calls.first().args[1];
      expect(unzipArgs[0]).toContain('artifacts.zip');
      expect(unzipArgs[1]).toBe('-d');
      expect(unzipArgs[2]).toContain('extracted');
    });

    it('should throw error if expected artifact is missing in the run', async () => {
      listWorkflowRunArtifactsSpy.and.resolveTo({
        data: {
          artifacts: [{name: 'some-other-artifact', id: 999}],
        },
      });

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(downloadArtifactSpy).not.toHaveBeenCalled();
      expect(spawnSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
      process.exitCode = undefined; // reset
    });
  });

  describe('PublishCiTool execution', () => {
    it('should instantiate and run PublishCiTool with correct local options', async () => {
      // Setup prototype spy to capture 'this' context and assert options
      publishCiRunSpy.and.callFake(function (this: PublishCiTool) {
        const options = this['options'];
        expect(options.builtPackagesDir).toContain('extracted');
        expect(options.expectedSha).toBe('mock-sha-12345');
        expect(options.useLocalNpmConfig).toBe(true);
        expect(options.dryRun).toBe(false);
        expect(options.skipTagging).toBe(true);
        return Promise.resolve();
      });

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345, {
        dryRun: false,
      });
      await tool.run();

      expect(publishCiRunSpy).toHaveBeenCalledTimes(1);
    });

    it('should propagate dry-run option to PublishCiTool', async () => {
      publishCiRunSpy.and.callFake(function (this: PublishCiTool) {
        expect(this['options'].dryRun).toBe(true);
        return Promise.resolve();
      });

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345, {
        dryRun: true,
      });
      await tool.run();

      expect(publishCiRunSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup', () => {
    it('should delete temp directory on successful execution', async () => {
      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(tempDirCreated).not.toBeNull();
      expect(fs.existsSync(tempDirCreated!)).toBe(false);
      expect(fs.rmSync).toHaveBeenCalledWith(tempDirCreated!, {recursive: true, force: true});
    });

    it('should delete temp directory even if workflow run fetch fails', async () => {
      getWorkflowRunSpy.and.rejectWith(new Error('GHA API error'));

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(tempDirCreated).not.toBeNull();
      expect(fs.existsSync(tempDirCreated!)).toBe(false);
      expect(fs.rmSync).toHaveBeenCalledWith(tempDirCreated!, {recursive: true, force: true});
      expect(process.exitCode).toBe(1);
      process.exitCode = undefined;
    });

    it('should delete temp directory even if unzip fails', async () => {
      spawnSpy.and.rejectWith(new Error('unzip failed'));

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(tempDirCreated).not.toBeNull();
      expect(fs.existsSync(tempDirCreated!)).toBe(false);
      expect(fs.rmSync).toHaveBeenCalledWith(tempDirCreated!, {recursive: true, force: true});
      expect(process.exitCode).toBe(1);
      process.exitCode = undefined;
    });

    it('should delete temp directory even if publishing fails', async () => {
      publishCiRunSpy.and.rejectWith(new Error('Publish error'));

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(tempDirCreated).not.toBeNull();
      expect(fs.existsSync(tempDirCreated!)).toBe(false);
      expect(fs.rmSync).toHaveBeenCalledWith(tempDirCreated!, {recursive: true, force: true});
      expect(process.exitCode).toBe(1);
      process.exitCode = undefined;
    });
  });
});
