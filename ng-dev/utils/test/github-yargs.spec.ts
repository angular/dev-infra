/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../git/authenticated-git-client.js';
import {configureGitClientWithTokenOrFromEnvironment} from '../git/github-yargs.js';

describe('github-yargs', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = {...process.env};
    spyOn(AuthenticatedGitClient, 'configure');
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should configure git client with GITHUB_TOKEN from environment and delete it', () => {
    process.env['GITHUB_TOKEN'] = 'test-github-token';
    delete process.env['TOKEN'];

    configureGitClientWithTokenOrFromEnvironment('');

    expect(AuthenticatedGitClient.configure).toHaveBeenCalledWith(
      'test-github-token',
      'user',
      'GITHUB_TOKEN',
    );
    expect(process.env['GITHUB_TOKEN']).toBeUndefined();
    expect(process.env['TOKEN']).toBeUndefined();
  });

  it('should configure git client with TOKEN from environment and delete it', () => {
    delete process.env['GITHUB_TOKEN'];
    process.env['TOKEN'] = 'test-token';

    configureGitClientWithTokenOrFromEnvironment('');

    expect(AuthenticatedGitClient.configure).toHaveBeenCalledWith('test-token', 'user', 'TOKEN');
    expect(process.env['GITHUB_TOKEN']).toBeUndefined();
    expect(process.env['TOKEN']).toBeUndefined();
  });

  it('should prefer GITHUB_TOKEN over TOKEN in environment', () => {
    process.env['GITHUB_TOKEN'] = 'test-github-token';
    process.env['TOKEN'] = 'test-token';

    configureGitClientWithTokenOrFromEnvironment('');

    expect(AuthenticatedGitClient.configure).toHaveBeenCalledWith(
      'test-github-token',
      'user',
      'GITHUB_TOKEN',
    );
    expect(process.env['GITHUB_TOKEN']).toBeUndefined();
    expect(process.env['TOKEN']).toBeUndefined();
  });

  it('should configure git client with CLI token, pass null for tokenEnvironmentVariable, and scrub ambient tokens', () => {
    process.env['GITHUB_TOKEN'] = 'ambient-github-token';
    process.env['TOKEN'] = 'ambient-token';

    configureGitClientWithTokenOrFromEnvironment('cli-token');

    expect(AuthenticatedGitClient.configure).toHaveBeenCalledWith('cli-token', 'user', null);
    expect(process.env['GITHUB_TOKEN']).toBeUndefined();
    expect(process.env['TOKEN']).toBeUndefined();
  });

  it('should throw an error if no token is available', () => {
    delete process.env['GITHUB_TOKEN'];
    delete process.env['TOKEN'];

    expect(() => configureGitClientWithTokenOrFromEnvironment('')).toThrowError(
      'Unable to determine the Github token.',
    );
    expect(AuthenticatedGitClient.configure).not.toHaveBeenCalled();
  });
});
