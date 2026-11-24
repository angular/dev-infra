/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';
import nock from 'nock';
import {join} from 'path';

import {GithubConfig} from '../../../utils/config.js';
import {Log} from '../../../utils/logging.js';
import {Prompt} from '../../../utils/prompt.js';
import {
  getMockGitClient,
  GithubTestingRepo,
  testTmpDir,
  VirtualGitClient,
} from '../../../utils/testing/index.js';
import {ReleaseConfig} from '../../config/index.js';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains.js';
import {ExitGateCommand} from '../../versioning/exit-gate.js';
import {NpmCommand} from '../../versioning/npm-command.js';
import {ReleaseTrain} from '../../versioning/release-trains.js';
import {ReleaseAction} from '../actions.js';
import {StageOnlySuccessError} from '../actions-error.js';
import {ExternalCommands} from '../external-commands.js';
import {CompletionState, ReleaseTool, ReleaseToolFlags} from '../index.js';
import {getTestConfigurationsForAction, prepareTempDirectory} from './test-utils/action-mocks.js';
import {fakeNpmPackageQueryRequest, parse} from './test-utils/test-utils.js';

/** Test subclass exposing protected `_config` for verifying flag overrides. */
class TestReleaseTool extends ReleaseTool {
  get resolvedConfig(): ReleaseConfig {
    return this._config;
  }
}

describe('ReleaseTool', () => {
  const baseReleaseTrains = new ActiveReleaseTrains({
    exceptionalMinor: null,
    releaseCandidate: null,
    next: new ReleaseTrain('master', parse('10.1.0-next.0')),
    latest: new ReleaseTrain('10.0.x', parse('10.0.1')),
  });

  let originalHusky: string | undefined;
  let githubConfig: GithubConfig;
  let releaseConfig: ReleaseConfig;
  let repo: GithubTestingRepo;
  let gitClient: VirtualGitClient;

  let checkoutSpy: jasmine.Spy;
  let actionPerformSpy: jasmine.Spy;
  let promptConfirmSpy: jasmine.Spy;
  let invokeNvmInstallSpy: jasmine.Spy;
  let npmCheckIsLoggedInSpy: jasmine.Spy;
  let npmStartInteractiveLoginSpy: jasmine.Spy;
  let npmLogoutSpy: jasmine.Spy;
  let exitGateCheckAdcSpy: jasmine.Spy;
  let exitGateStartAdcLoginSpy: jasmine.Spy;
  let logWarnSpy: jasmine.Spy;
  let logErrorSpy: jasmine.Spy;

  beforeEach(() => {
    originalHusky = process.env['HUSKY'];
    nock.cleanAll();
    prepareTempDirectory();

    // Mark package.json as `@angular/build-tooling` so `verifyNgDevToolIsUpToDate`
    // skips invoking pnpm in unit tests.
    writeFileSync(
      join(testTmpDir, 'package.json'),
      JSON.stringify({name: '@angular/build-tooling', version: '0.0.0'}),
    );

    const configs = getTestConfigurationsForAction();
    githubConfig = configs.githubConfig;
    releaseConfig = configs.releaseConfig;
    repo = new GithubTestingRepo(githubConfig.owner, githubConfig.name);
    gitClient = getMockGitClient(githubConfig, /* useSandboxGitClient */ false);

    spyOn(gitClient, 'getCurrentBranchOrRevision').and.returnValue('master');
    checkoutSpy = spyOn(gitClient, 'checkout').and.returnValue(true);
    spyOn(gitClient, 'hasUncommittedChanges').and.returnValue(false);
    spyOn(gitClient, 'isShallowRepo').and.returnValue(false);
    spyOn(gitClient, 'run').and.returnValue({
      stdout: 'HEAD_SHA\n',
      stderr: '',
      output: [],
      pid: -1,
      signal: null,
    });

    fakeNpmPackageQueryRequest(releaseConfig.representativeNpmPackage, {
      'dist-tags': {},
      versions: {'10.1.0-next.0': {}},
    });

    spyOn(ActiveReleaseTrains, 'fetch').and.resolveTo(baseReleaseTrains);

    actionPerformSpy = jasmine.createSpy('perform').and.resolveTo();
    spyOn(Prompt, 'select').and.callFake((() =>
      Promise.resolve({perform: actionPerformSpy} as unknown as ReleaseAction)) as any);

    promptConfirmSpy = spyOn(Prompt, 'confirm').and.resolveTo(false);
    invokeNvmInstallSpy = spyOn(ExternalCommands, 'invokeNvmInstall').and.resolveTo();
    npmCheckIsLoggedInSpy = spyOn(NpmCommand, 'checkIsLoggedIn').and.resolveTo(true);
    npmStartInteractiveLoginSpy = spyOn(NpmCommand, 'startInteractiveLogin').and.resolveTo();
    npmLogoutSpy = spyOn(NpmCommand, 'logout').and.resolveTo(false);
    exitGateCheckAdcSpy = spyOn(ExitGateCommand, 'checkAdcAuthenticated').and.resolveTo(true);
    exitGateStartAdcLoginSpy = spyOn(ExitGateCommand, 'startInteractiveAdcLogin').and.resolveTo();

    spyOn(Log, 'info');
    spyOn(Log, 'debug');
    logWarnSpy = spyOn(Log, 'warn');
    logErrorSpy = spyOn(Log, 'error');
  });

  afterEach(() => {
    if (originalHusky === undefined) {
      delete process.env['HUSKY'];
    } else {
      process.env['HUSKY'] = originalHusky;
    }
    nock.cleanAll();
  });

  function createTool(flags: ReleaseToolFlags = {}): TestReleaseTool {
    return new TestReleaseTool(gitClient, releaseConfig, githubConfig, testTmpDir, flags);
  }

  function expectPreFlightBranchCheck() {
    repo.expectBranchRequest(githubConfig.mainBranchName, {sha: 'HEAD_SHA'});
  }

  describe('flag overrides', () => {
    it('should preserve config publishRegistry and exitGate when no override flags are passed', () => {
      releaseConfig.publishRegistry = 'https://registry.example.com';
      releaseConfig.exitGate = {projectName: 'angular'};

      const tool = createTool();

      expect(tool.resolvedConfig.publishRegistry).toBe('https://registry.example.com');
      expect(tool.resolvedConfig.exitGate).toEqual({projectName: 'angular'});
    });

    it('should override config with --exit-gate-project and clear publishRegistry', () => {
      releaseConfig.publishRegistry = 'https://registry.example.com';
      releaseConfig.exitGate = {projectName: 'old-project'};

      const tool = createTool({exitGateProject: 'angular-cli'});

      expect(tool.resolvedConfig.exitGate).toEqual({projectName: 'angular-cli'});
      expect(tool.resolvedConfig.publishRegistry).toBeUndefined();
    });

    it('should throw when --exit-gate-project is invalid', () => {
      expect(() => createTool({exitGateProject: '../invalid'})).toThrowError(
        /Invalid OSS Exit Gate project name/,
      );
    });

    it('should override config exitGate when --publishRegistry is explicitly passed', () => {
      releaseConfig.exitGate = {projectName: 'angular'};

      const tool = createTool({publishRegistry: 'http://localhost:4873'});

      expect(tool.resolvedConfig.publishRegistry).toBe('http://localhost:4873');
      expect(tool.resolvedConfig.exitGate).toBeUndefined();
    });

    it('should give --publishRegistry precedence over --exit-gate-project', () => {
      const tool = createTool({
        publishRegistry: 'http://localhost:4873',
        exitGateProject: 'angular',
      });

      expect(tool.resolvedConfig.publishRegistry).toBe('http://localhost:4873');
      expect(tool.resolvedConfig.exitGate).toBeUndefined();
    });
  });

  describe('--stage-only mode', () => {
    it('should skip auth verification and npm logout in standard NPM mode', async () => {
      expectPreFlightBranchCheck();
      actionPerformSpy.and.rejectWith(
        new StageOnlySuccessError({
          id: 123,
          url: 'https://github.com/angular/dev-infra-test/pull/123',
          fork: {owner: 'some-user', name: 'fork'},
          forkBranch: 'release-stage-10.1.0-next.0',
        }),
      );

      const tool = createTool({stageOnly: true});
      const result = await tool.run();

      expect(result).toBe(CompletionState.SUCCESS);
      expect(npmCheckIsLoggedInSpy).not.toHaveBeenCalled();
      expect(exitGateCheckAdcSpy).not.toHaveBeenCalled();
      expect(npmLogoutSpy).not.toHaveBeenCalled();
      expect(checkoutSpy).toHaveBeenCalledOnceWith('master', true);
      expect(invokeNvmInstallSpy).toHaveBeenCalledOnceWith(testTmpDir, true);
    });

    it('should skip auth verification and npm logout in OSS Exit Gate mode', async () => {
      releaseConfig.exitGate = {projectName: 'angular'};
      expectPreFlightBranchCheck();

      const tool = createTool({stageOnly: true});
      const result = await tool.run();

      expect(result).toBe(CompletionState.SUCCESS);
      expect(exitGateCheckAdcSpy).not.toHaveBeenCalled();
      expect(npmCheckIsLoggedInSpy).not.toHaveBeenCalled();
      expect(npmLogoutSpy).not.toHaveBeenCalled();
      expect(actionPerformSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('OSS Exit Gate authentication and cleanup', () => {
    it('should verify ADC authentication and skip npm logout on cleanup when authenticated', async () => {
      releaseConfig.exitGate = {projectName: 'angular'};
      expectPreFlightBranchCheck();

      const tool = createTool();
      const result = await tool.run();

      expect(result).toBe(CompletionState.SUCCESS);
      expect(exitGateCheckAdcSpy).toHaveBeenCalledTimes(1);
      expect(exitGateStartAdcLoginSpy).not.toHaveBeenCalled();
      expect(promptConfirmSpy).not.toHaveBeenCalled();
      expect(npmCheckIsLoggedInSpy).not.toHaveBeenCalled();
      expect(npmLogoutSpy).not.toHaveBeenCalled();
      expect(actionPerformSpy).toHaveBeenCalledTimes(1);
      expect(checkoutSpy).toHaveBeenCalledOnceWith('master', true);
      expect(invokeNvmInstallSpy).toHaveBeenCalledOnceWith(testTmpDir, true);
    });

    it('should prompt for interactive ADC login when unauthenticated and proceed if confirmed', async () => {
      releaseConfig.exitGate = {projectName: 'angular'};
      exitGateCheckAdcSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(true);
      expectPreFlightBranchCheck();

      const tool = createTool();
      const result = await tool.run();

      expect(result).toBe(CompletionState.SUCCESS);
      expect(exitGateCheckAdcSpy).toHaveBeenCalledTimes(1);
      expect(logWarnSpy).toHaveBeenCalledWith(jasmine.stringContaining('OSS Exit Gate'));
      expect(promptConfirmSpy).toHaveBeenCalledOnceWith({
        message:
          'Would you like to authenticate with Google Cloud (gcloud auth application-default login) now?',
      });
      expect(exitGateStartAdcLoginSpy).toHaveBeenCalledTimes(1);
      expect(actionPerformSpy).toHaveBeenCalledTimes(1);
      expect(npmLogoutSpy).not.toHaveBeenCalled();
    });

    it('should abort if unauthenticated and user declines ADC login', async () => {
      releaseConfig.exitGate = {projectName: 'angular'};
      exitGateCheckAdcSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(false);
      expectPreFlightBranchCheck();

      const tool = createTool();
      const result = await tool.run();

      expect(result).toBe(CompletionState.MANUALLY_ABORTED);
      expect(exitGateCheckAdcSpy).toHaveBeenCalledTimes(1);
      expect(exitGateStartAdcLoginSpy).not.toHaveBeenCalled();
      expect(actionPerformSpy).not.toHaveBeenCalled();
      expect(npmLogoutSpy).not.toHaveBeenCalled();
    });

    it('should log an error and abort if interactive ADC login fails', async () => {
      releaseConfig.exitGate = {projectName: 'angular'};
      exitGateCheckAdcSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(true);
      exitGateStartAdcLoginSpy.and.rejectWith(new Error('gcloud failed'));
      expectPreFlightBranchCheck();

      const tool = createTool();
      const result = await tool.run();

      expect(result).toBe(CompletionState.MANUALLY_ABORTED);
      expect(logErrorSpy).toHaveBeenCalled();
      expect(actionPerformSpy).not.toHaveBeenCalled();
      expect(npmLogoutSpy).not.toHaveBeenCalled();
    });

    it('should use OSS Exit Gate auth when --exit-gate-project flag overrides config', async () => {
      releaseConfig.publishRegistry = 'https://custom-npm-registry.example.com';
      expectPreFlightBranchCheck();

      const tool = createTool({exitGateProject: 'angular'});
      const result = await tool.run();

      expect(result).toBe(CompletionState.SUCCESS);
      expect(exitGateCheckAdcSpy).toHaveBeenCalledTimes(1);
      expect(npmCheckIsLoggedInSpy).not.toHaveBeenCalled();
      expect(npmLogoutSpy).not.toHaveBeenCalled();
    });
  });

  describe('standard NPM registry authentication and cleanup', () => {
    it('should check NPM login state and call NpmCommand.logout on cleanup', async () => {
      expectPreFlightBranchCheck();

      const tool = createTool();
      const result = await tool.run();

      expect(result).toBe(CompletionState.SUCCESS);
      expect(npmCheckIsLoggedInSpy).toHaveBeenCalledOnceWith(undefined);
      expect(exitGateCheckAdcSpy).not.toHaveBeenCalled();
      expect(actionPerformSpy).toHaveBeenCalledTimes(1);
      expect(npmLogoutSpy).toHaveBeenCalledOnceWith(undefined);
    });

    it('should check NPM login state for custom publishRegistry and log out on cleanup', async () => {
      const customRegistry = 'https://custom-npm-registry.example.com';
      releaseConfig.publishRegistry = customRegistry;
      expectPreFlightBranchCheck();

      const tool = createTool();
      const result = await tool.run();

      expect(result).toBe(CompletionState.SUCCESS);
      expect(npmCheckIsLoggedInSpy).toHaveBeenCalledOnceWith(customRegistry);
      expect(npmStartInteractiveLoginSpy).not.toHaveBeenCalled();
      expect(npmLogoutSpy).toHaveBeenCalledOnceWith(customRegistry);
    });

    it('should prompt for interactive NPM login when not logged in and proceed if confirmed', async () => {
      npmCheckIsLoggedInSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(true);
      expectPreFlightBranchCheck();

      const tool = createTool();
      const result = await tool.run();

      expect(result).toBe(CompletionState.SUCCESS);
      expect(promptConfirmSpy).toHaveBeenCalledOnceWith({
        message: 'Would you like to log into NPM now?',
      });
      expect(npmStartInteractiveLoginSpy).toHaveBeenCalledOnceWith(undefined);
      expect(actionPerformSpy).toHaveBeenCalledTimes(1);
      expect(npmLogoutSpy).toHaveBeenCalledOnceWith(undefined);
    });

    it('should abort when not logged in and user declines NPM login', async () => {
      npmCheckIsLoggedInSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(false);
      expectPreFlightBranchCheck();

      const tool = createTool();
      const result = await tool.run();

      expect(result).toBe(CompletionState.MANUALLY_ABORTED);
      expect(npmStartInteractiveLoginSpy).not.toHaveBeenCalled();
      expect(actionPerformSpy).not.toHaveBeenCalled();
      expect(npmLogoutSpy).not.toHaveBeenCalled();
    });

    it('should abort when interactive NPM login fails', async () => {
      npmCheckIsLoggedInSpy.and.resolveTo(false);
      promptConfirmSpy.and.resolveTo(true);
      npmStartInteractiveLoginSpy.and.rejectWith(new Error('npm login failed'));
      expectPreFlightBranchCheck();

      const tool = createTool();
      const result = await tool.run();

      expect(result).toBe(CompletionState.MANUALLY_ABORTED);
      expect(actionPerformSpy).not.toHaveBeenCalled();
      expect(npmLogoutSpy).not.toHaveBeenCalled();
    });

    it('should use standard NPM auth and logout when --publishRegistry overrides config.exitGate', async () => {
      releaseConfig.exitGate = {projectName: 'angular'};
      expectPreFlightBranchCheck();

      const tool = createTool({publishRegistry: 'http://localhost:4873'});
      const result = await tool.run();

      expect(result).toBe(CompletionState.SUCCESS);
      expect(exitGateCheckAdcSpy).not.toHaveBeenCalled();
      expect(npmCheckIsLoggedInSpy).toHaveBeenCalledOnceWith('http://localhost:4873');
      expect(npmLogoutSpy).toHaveBeenCalledOnceWith('http://localhost:4873');
    });
  });
});
