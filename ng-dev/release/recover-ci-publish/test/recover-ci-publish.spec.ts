/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'node:fs';
import {ReleaseRecoverCiPublishTool} from '../recover-ci-publish.js';
import {ChildProcess} from '../../../utils/child-process.js';
import {ExitGateCommand} from '../../versioning/exit-gate.js';
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
  let spawnSpy: jasmine.Spy;
  let publishCiRunSpy: jasmine.Spy;
  let checkAdcAuthenticatedSpy: jasmine.Spy;
  let startInteractiveAdcLoginSpy: jasmine.Spy;
  let promptConfirmSpy: jasmine.Spy;

  beforeEach(() => {
    tempDirCreated = null;
    process.exitCode = undefined;

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
          {name: 'other-artifact', id: 111, expired: false},
          {name: 'release-packages', id: 222, expired: false},
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
      exitGate: {projectName: 'angular'},
      npmPackages: [{name: '@angular/core'}],
      representativeNpmPackage: '@angular/core',
    };

    githubConfig = {
      owner: 'angular',
      name: 'angular',
    };

    // Mock ChildProcess.spawn (for unzip)
    spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({stdout: '', stderr: ''} as any);

    // Mock ExitGateCommand static methods
    checkAdcAuthenticatedSpy = spyOn(ExitGateCommand, 'checkAdcAuthenticated').and.resolveTo(true);
    startInteractiveAdcLoginSpy = spyOn(
      ExitGateCommand,
      'startInteractiveAdcLogin',
    ).and.resolveTo();

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
    process.exitCode = undefined;
    // Clean up any leaked temp directories if test failed before cleanup
    if (tempDirCreated && fs.existsSync(tempDirCreated)) {
      try {
        fs.rmSync(tempDirCreated, {recursive: true, force: true});
      } catch {}
    }
  });

  describe('Google Cloud ADC verification & config validation', () => {
    it('should proceed when already authenticated via ADC', async () => {
      checkAdcAuthenticatedSpy.and.resolveTo(true);

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(checkAdcAuthenticatedSpy).toHaveBeenCalledTimes(1);
      expect(promptConfirmSpy).not.toHaveBeenCalled();
      expect(startInteractiveAdcLoginSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).toHaveBeenCalledTimes(1);
    });

    it('should prompt and run interactive ADC login when unauthenticated and user confirms', async () => {
      checkAdcAuthenticatedSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(true);

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(checkAdcAuthenticatedSpy).toHaveBeenCalledTimes(1);
      expect(promptConfirmSpy).toHaveBeenCalledWith({
        message:
          'Would you like to authenticate with Google Cloud (gcloud auth application-default login) now?',
      });
      expect(startInteractiveAdcLoginSpy).toHaveBeenCalledTimes(1);
      expect(publishCiRunSpy).toHaveBeenCalledTimes(1);
    });

    it('should abort when unauthenticated and user declines login', async () => {
      checkAdcAuthenticatedSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(false);

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(checkAdcAuthenticatedSpy).toHaveBeenCalledTimes(1);
      expect(promptConfirmSpy).toHaveBeenCalledTimes(1);
      expect(startInteractiveAdcLoginSpy).not.toHaveBeenCalled();
      expect(getWorkflowRunSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).not.toHaveBeenCalled();
      expect(tempDirCreated).toBeNull();
      expect(process.exitCode).toBe(1);
    });

    it('should abort when startInteractiveAdcLogin rejects', async () => {
      checkAdcAuthenticatedSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(true);
      startInteractiveAdcLoginSpy.and.rejectWith(new Error('gcloud login failed'));

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(checkAdcAuthenticatedSpy).toHaveBeenCalledTimes(1);
      expect(startInteractiveAdcLoginSpy).toHaveBeenCalledTimes(1);
      expect(getWorkflowRunSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).not.toHaveBeenCalled();
      expect(tempDirCreated).toBeNull();
      expect(process.exitCode).toBe(1);
    });

    it('should skip ADC check in dry-run mode', async () => {
      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345, {
        dryRun: true,
      });
      await tool.run();

      expect(checkAdcAuthenticatedSpy).not.toHaveBeenCalled();
      expect(startInteractiveAdcLoginSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).toHaveBeenCalledTimes(1);
    });

    it('should abort fail-fast when exitGateProject is missing in non-dry-run mode', async () => {
      releaseConfig.exitGate = undefined;

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345, {
        dryRun: false,
      });
      await tool.run();

      expect(checkAdcAuthenticatedSpy).not.toHaveBeenCalled();
      expect(getWorkflowRunSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).not.toHaveBeenCalled();
      expect(tempDirCreated).toBeNull();
      expect(Log.error).toHaveBeenCalledWith(
        'OSS Exit Gate project name is not defined. Configure `release.exitGate.projectName` or pass `--exit-gate-project`.',
      );
      expect(process.exitCode).toBe(1);
    });

    it('should abort fail-fast when exitGateProject has an invalid format', async () => {
      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345, {
        exitGateProject: '../evil',
      });
      await tool.run();

      expect(checkAdcAuthenticatedSpy).not.toHaveBeenCalled();
      expect(getWorkflowRunSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).not.toHaveBeenCalled();
      expect(tempDirCreated).toBeNull();
      expect(process.exitCode).toBe(1);
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

      // Verify downloadArtifact called with correct artifact ID (222 for release-packages)
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
          artifacts: [{name: 'some-other-artifact', id: 999, expired: false}],
        },
      });

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(downloadArtifactSpy).not.toHaveBeenCalled();
      expect(spawnSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    it('should throw error before downloading if expected artifact has expired', async () => {
      listWorkflowRunArtifactsSpy.and.resolveTo({
        data: {
          artifacts: [{name: 'release-packages', id: 222, expired: true}],
        },
      });

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345);
      await tool.run();

      expect(downloadArtifactSpy).not.toHaveBeenCalled();
      expect(spawnSpy).not.toHaveBeenCalled();
      expect(publishCiRunSpy).not.toHaveBeenCalled();
      expect(Log.error).toHaveBeenCalledWith(
        new Error(
          'Artifact "release-packages" (ID: 222) in run 12345 has expired and can no longer be downloaded.',
        ),
      );
      expect(process.exitCode).toBe(1);
    });
  });

  describe('PublishCiTool execution', () => {
    it('should instantiate and run PublishCiTool with correct local options', async () => {
      // Setup prototype spy to capture 'this' context and assert options
      publishCiRunSpy.and.callFake(function (this: PublishCiTool) {
        const options = this['options'];
        expect(options.builtPackagesDir).toContain('extracted');
        expect(options.expectedSha).toBe('mock-sha-12345');
        expect(options.exitGateProject).toBe('angular');
        expect(options.useApplicationDefaultCredentials).toBe(true);
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

    it('should forward CLI exitGateProject override to PublishCiTool', async () => {
      publishCiRunSpy.and.callFake(function (this: PublishCiTool) {
        expect(this['options'].exitGateProject).toBe('custom-project');
        return Promise.resolve();
      });

      const tool = new ReleaseRecoverCiPublishTool(gitClient, releaseConfig, githubConfig, 12345, {
        exitGateProject: 'custom-project',
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
