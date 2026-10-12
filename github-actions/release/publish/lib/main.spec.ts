import {AuthenticatedGitClient} from '../../../../ng-dev/utils/git/authenticated-git-client.js';
import {setConfig} from '../../../../ng-dev/utils/config.js';
import {ANGULAR_ROBOT, utils} from '../../../utils.js';
import {PublishCiTool} from './publish-ci.js';
import {run} from './main.js';

describe('release publish action main', () => {
  let getAuthTokenForSpy: jasmine.Spy;
  let revokeActiveInstallationTokenSpy: jasmine.Spy;
  let toolRunSpy: jasmine.Spy;
  let stdoutWriteSpy: jasmine.Spy;

  beforeEach(() => {
    getAuthTokenForSpy = spyOn(utils, 'getAuthTokenFor').and.resolveTo('test-token-12345');
    revokeActiveInstallationTokenSpy = spyOn(
      utils,
      'revokeActiveInstallationToken',
    ).and.resolveTo();

    process.env['INPUT_WOMBOT-TOKEN'] = 'mock-wombot-token';
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

    toolRunSpy = spyOn(PublishCiTool.prototype, 'run').and.resolveTo();
    stdoutWriteSpy = spyOn(process.stdout, 'write').and.callThrough();
  });

  afterEach(() => {
    delete process.env['INPUT_WOMBOT-TOKEN'];
    delete process.env['INPUT_BUILT-PACKAGES-DIR'];
    delete process.env['INPUT_EXPECTED-SHA'];
    delete process.env['INPUT_DRY-RUN'];
    delete process.env['WOMBOT_TOKEN'];
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
});
