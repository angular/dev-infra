/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, mkdirSync, rmdirSync, writeFileSync} from 'fs';
import {join} from 'path';

import * as npm from '../../../versioning/npm-publish';
import * as constants from '../../constants';
import * as externalCommands from '../../external-commands';
import * as console from '../../../../utils/console';

import {ReleaseAction} from '../../actions';
import * as config from '../../../../utils/config';
import {ReleaseConfig} from '../../../config';
import {
  installVirtualGitClientSpies,
  testTmpDir,
  VirtualGitClient,
} from '../../../../utils/testing';
import {installSandboxGitClient} from '../../../../utils/testing';
import {getMockGitClient} from '../../../../utils/testing';

/** List of NPM packages which are configured for release action tests. */
export const testReleasePackages = ['@angular/pkg1', '@angular/pkg2'];

/** Gets test configurations for running testing a publish action. */
export function getTestConfigurationsForAction() {
  const githubConfig: config.GithubConfig = {
    owner: 'angular',
    name: 'dev-infra-test',
    mainBranchName: 'master',
  };
  const releaseConfig: ReleaseConfig = {
    npmPackages: testReleasePackages,
    buildPackages: () => {
      throw Error('Not implemented');
    },
  };
  return {githubConfig, releaseConfig};
}

/**
 * Prepares the temporary test directory by deleting previous
 * contents if present. Ensures the temp directory exists.
 */
export function prepareTempDirectory() {
  if (existsSync(testTmpDir)) {
    rmdirSync(testTmpDir, {recursive: true});
  }
  mkdirSync(testTmpDir);
}

/** Sets up all test mocks needed to run a release action. */
export function setupMocksForReleaseAction<T extends boolean>(
  githubConfig: config.GithubConfig,
  releaseConfig: ReleaseConfig,
  useSandboxGitClient: T,
) {
  // Clear the temporary directory. We do not want the repo state
  // to persist between tests if the sandbox git client is used.
  prepareTempDirectory();

  // Set the configuration to be used throughout the spec.
  spyOn(config, 'getConfig').and.returnValue({github: githubConfig, release: releaseConfig});

  // Fake confirm any prompts. We do not want to make any changelog edits and
  // just proceed with the release action.
  spyOn(console, 'promptConfirm').and.resolveTo(true);

  // Fake all external commands for the release tool.
  spyOn(npm, 'runNpmPublish').and.resolveTo();
  spyOn(externalCommands, 'invokeSetNpmDistCommand').and.resolveTo();
  spyOn(externalCommands, 'invokeYarnInstallCommand').and.resolveTo();
  spyOn(externalCommands, 'invokeReleaseBuildCommand').and.resolveTo(
    testReleasePackages.map((name) => ({name, outputPath: `${testTmpDir}/dist/${name}`})),
  );

  // Fake checking the package versions since we don't actually create NPM
  // package output that can be tested.
  spyOn(ReleaseAction.prototype, '_verifyPackageVersions' as any).and.resolveTo();

  // Create an empty changelog and a `package.json` file so that file system
  // interactions with the project directory do not cause exceptions.
  writeFileSync(join(testTmpDir, 'CHANGELOG.md'), '<a name="0.0.0"></a>\nExisting changelog');
  writeFileSync(join(testTmpDir, 'package.json'), JSON.stringify({version: '0.0.0'}));

  // Override the default pull request wait interval to a number of milliseconds that can be
  // awaited in Jasmine tests. The default interval of 10sec is too large and causes a timeout.
  Object.defineProperty(constants, 'waitForPullRequestInterval', {value: 50});

  // Get a mocked `GitClient` for testing release actions.
  const gitClient = getMockGitClient(githubConfig, useSandboxGitClient);

  if (gitClient instanceof VirtualGitClient) {
    installVirtualGitClientSpies(gitClient);
  } else {
    installSandboxGitClient(gitClient);

    // If we run with a sandbox git client, we assume the upstream branches exist locally.
    // This is necessary for testing as we cannot fake an upstream remote.
    spyOn(ReleaseAction.prototype as any, 'checkoutUpstreamBranch').and.callFake((n: string) =>
      gitClient.run(['checkout', n]),
    );
  }

  return {gitClient};
}
