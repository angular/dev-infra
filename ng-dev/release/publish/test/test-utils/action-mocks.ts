/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, mkdirSync, rmSync, writeFileSync} from 'fs';
import {join} from 'path';
import {GithubConfig, setConfig} from '../../../../utils/config.js';
import {Prompt} from '../../../../utils/prompt.js';

import {
  getMockGitClient,
  installSandboxGitClient,
  installVirtualGitClientSpies,
  testTmpDir,
  VirtualGitClient,
} from '../../../../utils/testing/index.js';
import {
  BuiltPackage,
  BuiltPackageWithInfo,
  NpmPackage,
  ReleaseConfig,
} from '../../../config/index.js';
import {NpmCommand} from '../../../versioning/npm-command.js';
import {PullRequest, ReleaseAction} from '../../actions.js';
import {DirectoryHash} from '../../directory-hash.js';
import {ExternalCommands} from '../../external-commands.js';

/** Default representative NPM package used in tests. */
export const testRepresentativePackage = '@angular/pkg1';

/** Fake hash value for package contents. */
const fakePackageContentHash = '<expected-content-hash>';

/** List of NPM packages which are configured for release action tests. */
export const testReleasePackages: NpmPackage[] = [
  {name: '@angular/pkg1'},
  {name: '@angular/pkg2'},
  {name: '@experimental/somepkg', experimental: true},
];

/** Gets test configurations for running testing a publish action. */
export function getTestConfigurationsForAction() {
  const githubConfig: GithubConfig = {
    owner: 'angular',
    name: 'dev-infra-test',
    mainBranchName: 'master',
  };
  const releaseConfig: ReleaseConfig = {
    representativeNpmPackage: testRepresentativePackage,
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
    rmSync(testTmpDir, {recursive: true});
  }
  mkdirSync(testTmpDir);
}

/** Sets up all test mocks needed to run a release action. */
export function setupMocksForReleaseAction<T extends boolean>(
  githubConfig: GithubConfig,
  releaseConfig: ReleaseConfig,
  stubBuiltPackageOutputChecks: boolean,
  useSandboxGitClient: T,
) {
  // Clear the temporary directory. We do not want the repo state
  // to persist between tests if the sandbox git client is used.
  prepareTempDirectory();

  // Set the configuration to be used throughout the spec.
  setConfig({github: githubConfig, release: releaseConfig});

  // Fake confirm any prompts. We do not want to make any changelog edits and
  // just proceed with the release action.
  spyOn(Prompt, 'confirm').and.resolveTo(true);

  const builtPackagesWithInfo: BuiltPackageWithInfo[] = testReleasePackages.map((pkg) => ({
    ...pkg,
    hash: fakePackageContentHash,
    outputPath: `${testTmpDir}/dist/${pkg.name}`,
  }));

  const builtPackages: BuiltPackage[] = builtPackagesWithInfo.map((pkg) => ({
    name: pkg.name,
    outputPath: pkg.outputPath,
  }));

  // Fake all external commands for the release tool.
  spyOn(NpmCommand, 'publish').and.resolveTo();
  spyOn(ExternalCommands, 'invokeSetNpmDist').and.resolveTo();
  spyOn(ExternalCommands, 'invokeYarnInstall').and.resolveTo();
  spyOn(ExternalCommands, 'invokeReleaseInfo').and.resolveTo(releaseConfig);
  spyOn(ExternalCommands, 'invokeReleaseBuild').and.resolveTo(builtPackages);
  spyOn(ExternalCommands, 'invokeReleasePrecheck').and.resolveTo();

  if (stubBuiltPackageOutputChecks) {
    // Fake checking the package versions since we don't actually create NPM
    // package output that can be tested.
    spyOn(ReleaseAction.prototype, '_verifyPackageVersions' as any).and.resolveTo();

    spyOn(DirectoryHash, 'compute').and.resolveTo(fakePackageContentHash);
  }

  // Override the default pull request wait interval to a number of milliseconds that can be
  // awaited in Jasmine tests. The default interval of 10sec is too large and causes a timeout.
  const originalWaitFn = ReleaseAction.prototype['waitForPullRequestToBeMerged'];
  spyOn(ReleaseAction.prototype, 'waitForPullRequestToBeMerged' as any).and.callFake(function (
    this: ReleaseAction,
    pullRequest: PullRequest,
  ) {
    return originalWaitFn.call(this, pullRequest, /* interval */ 10);
  });

  // Create an empty changelog and a `package.json` file so that file system
  // interactions with the project directory do not cause exceptions.
  writeFileSync(join(testTmpDir, 'CHANGELOG.md'), '<a name="0.0.0"></a>\nExisting changelog');
  writeFileSync(join(testTmpDir, 'package.json'), JSON.stringify({version: '0.0.0'}));

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

  return {gitClient, builtPackagesWithInfo};
}
