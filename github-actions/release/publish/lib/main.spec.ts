import {AuthenticatedGitClient} from '../../../../ng-dev/utils/git/authenticated-git-client.js';
import {ChildProcess} from '../../../../ng-dev/utils/child-process.js';
import {setConfig} from '../../../../ng-dev/utils/config.js';
import {ANGULAR_ROBOT, utils} from '../../../utils.js';
import {PublishCiTool, PublishCiToolOptions} from './publish-ci.js';
import {run} from './main.js';

describe('release publish action main', () => {
  let getAuthTokenForSpy: jasmine.Spy;
  let revokeActiveInstallationTokenSpy: jasmine.Spy;
  let toolRunSpy: jasmine.Spy;
  let stdoutWriteSpy: jasmine.Spy;
  let capturedOptions: PublishCiToolOptions | undefined;

  beforeEach(() => {
    capturedOptions = undefined;
    getAuthTokenForSpy = spyOn(utils, 'getAuthTokenFor').and.resolveTo('test-token-12345');
    revokeActiveInstallationTokenSpy = spyOn(
      utils,
      'revokeActiveInstallationToken',
    ).and.resolveTo();

    process.env['INPUT_ANGULAR-ROBOT-KEY'] = 'mock-angular-robot-key';
    process.env['INPUT_EXIT-GATE-PROJECT'] = 'angular';
    process.env['INPUT_BUILT-PACKAGES-DIR'] = '/tmp/mock-built-packages';
    process.env['INPUT_EXPECTED-SHA'] = '0123456789abcdef0123456789abcdef01234567';
    process.env['INPUT_DRY-RUN'] = 'false';

    setConfig({
      github: {
        mergeMode: 'caretaker-only' as any,
        owner: 'angular',
        name: 'angular',
        mainBranchName: 'main',
      },
      release: {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}],
        buildPackages: async () => [],
      },
    });

    spyOn(AuthenticatedGitClient, 'configure');
    spyOn(AuthenticatedGitClient, 'get').and.resolveTo({
      baseDir: '/tmp/mock-repo',
    } as any);

    toolRunSpy = spyOn(PublishCiTool.prototype, 'run').and.callFake(async function (
      this: PublishCiTool,
    ) {
      capturedOptions = (this as unknown as {options: PublishCiToolOptions}).options;
    });
    stdoutWriteSpy = spyOn(process.stdout, 'write').and.callThrough();
  });

  afterEach(() => {
    delete process.env['INPUT_ANGULAR-ROBOT-KEY'];
    delete process.env['INPUT_EXIT-GATE-PROJECT'];
    delete process.env['INPUT_BUILT-PACKAGES-DIR'];
    delete process.env['INPUT_EXPECTED-SHA'];
    delete process.env['INPUT_DRY-RUN'];
    process.exitCode = 0;
  });

  it('should revoke active installation token on successful run', async () => {
    await run();

    expect(getAuthTokenForSpy).toHaveBeenCalledWith(ANGULAR_ROBOT);
    expect(toolRunSpy).toHaveBeenCalled();
    expect(revokeActiveInstallationTokenSpy).toHaveBeenCalledWith('test-token-12345');
    expect(stdoutWriteSpy).not.toHaveBeenCalledWith(jasmine.stringContaining('::error::'));
  });

  it('should revoke active installation token when PublishCiTool throws', async () => {
    toolRunSpy.and.rejectWith(new Error('Publish failed due to network timeout'));

    await run();

    expect(toolRunSpy).toHaveBeenCalled();
    expect(stdoutWriteSpy).toHaveBeenCalledWith(
      jasmine.stringContaining('::error::Publish failed due to network timeout'),
    );
    expect(revokeActiveInstallationTokenSpy).toHaveBeenCalledWith('test-token-12345');
  });

  it('should catch and warn if revokeActiveInstallationToken throws, preserving failure state', async () => {
    toolRunSpy.and.rejectWith(new Error('Primary publish failure'));
    revokeActiveInstallationTokenSpy.and.rejectWith(new Error('GitHub API 500 revocation error'));

    await run();

    expect(stdoutWriteSpy).toHaveBeenCalledWith(
      jasmine.stringContaining('::error::Primary publish failure'),
    );
    expect(revokeActiveInstallationTokenSpy).toHaveBeenCalledWith('test-token-12345');
    expect(stdoutWriteSpy).toHaveBeenCalledWith(
      jasmine.stringMatching(/::warning::Failed to revoke active installation token/),
    );
  });

  it('should not attempt revocation if getAuthTokenFor fails before token is minted', async () => {
    getAuthTokenForSpy.and.rejectWith(new Error('Private key invalid'));

    await run();

    expect(stdoutWriteSpy).toHaveBeenCalledWith(
      jasmine.stringContaining('::error::Private key invalid'),
    );
    expect(revokeActiveInstallationTokenSpy).not.toHaveBeenCalled();
  });

  it('should forward exitGateProject from INPUT_EXIT-GATE-PROJECT and maskSecret callback to PublishCiTool', async () => {
    process.env['INPUT_EXIT-GATE-PROJECT'] = 'angular-components';

    await run();

    expect(toolRunSpy).toHaveBeenCalled();
    expect(capturedOptions).toEqual({
      builtPackagesDir: '/tmp/mock-built-packages',
      expectedSha: '0123456789abcdef0123456789abcdef01234567',
      exitGateProject: 'angular-components',
      dryRun: false,
      maskSecret: jasmine.any(Function),
    });

    capturedOptions!.maskSecret!('mock-secret-value');
    expect(stdoutWriteSpy).toHaveBeenCalledWith(
      jasmine.stringContaining('::add-mask::mock-secret-value'),
    );
  });

  it('should forward undefined exitGateProject when INPUT_EXIT-GATE-PROJECT is unset', async () => {
    delete process.env['INPUT_EXIT-GATE-PROJECT'];

    await run();

    expect(toolRunSpy).toHaveBeenCalled();
    expect(capturedOptions).toEqual({
      builtPackagesDir: '/tmp/mock-built-packages',
      expectedSha: '0123456789abcdef0123456789abcdef01234567',
      exitGateProject: undefined,
      dryRun: false,
      maskSecret: jasmine.any(Function),
    });
  });

  it('should delete INPUT_ANGULAR-ROBOT-KEY after minting installation token', async () => {
    let robotKeyDuringToolRun: string | undefined = 'not-checked';
    toolRunSpy.and.callFake(async () => {
      robotKeyDuringToolRun = process.env['INPUT_ANGULAR-ROBOT-KEY'];
    });

    expect(process.env['INPUT_ANGULAR-ROBOT-KEY']).toBe('mock-angular-robot-key');

    await run();

    expect(getAuthTokenForSpy).toHaveBeenCalledWith(ANGULAR_ROBOT);
    expect(robotKeyDuringToolRun).toBeUndefined();
    expect(process.env['INPUT_ANGULAR-ROBOT-KEY']).toBeUndefined();
  });

  it('should succeed in dry-run mode when INPUT_EXIT-GATE-PROJECT is omitted', async () => {
    delete process.env['INPUT_EXIT-GATE-PROJECT'];
    process.env['INPUT_DRY-RUN'] = 'true';

    await run();

    expect(toolRunSpy).toHaveBeenCalled();
    expect(capturedOptions).toEqual({
      builtPackagesDir: '/tmp/mock-built-packages',
      expectedSha: '0123456789abcdef0123456789abcdef01234567',
      exitGateProject: undefined,
      dryRun: true,
      maskSecret: jasmine.any(Function),
    });
    expect(stdoutWriteSpy).not.toHaveBeenCalledWith(jasmine.stringContaining('::error::'));
    expect(process.exitCode).not.toBe(1);
  });

  it('should call core.setFailed and not mint installation token if getConfig() throws', async () => {
    setConfig(null);
    spyOn(ChildProcess, 'spawnSync').and.returnValue({
      status: 1,
      stdout: '',
      stderr: 'fatal: not a git repository',
    } as any);

    await run();

    expect(stdoutWriteSpy).toHaveBeenCalledWith(
      jasmine.stringContaining(
        '::error::Unable to find the path to the base directory of the repository.',
      ),
    );
    expect(process.exitCode).toBe(1);
    expect(getAuthTokenForSpy).not.toHaveBeenCalled();
    expect(revokeActiveInstallationTokenSpy).not.toHaveBeenCalled();
    expect(toolRunSpy).not.toHaveBeenCalled();
  });
});
