/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubConfig} from '../../../../utils/config.js';
import {
  GithubTestingRepo,
  SandboxGitClient,
  VirtualGitClient,
} from '../../../../utils/testing/index.js';
import {BuiltPackageWithInfo, ReleaseConfig} from '../../../config/index.js';
import {ActiveReleaseTrains} from '../../../versioning/index.js';
import {ReleaseAction} from '../../actions.js';

export interface TestOptions {
  /**
   * Whether the test should operate using a sandbox Git client.
   */
  useSandboxGitClient?: boolean;
  /**
   * Whether the built package output checks should be stubbed
   * as noop for this test.
   */
  stubBuiltPackageOutputChecks?: boolean;
}

/** Type describing the default options. Used for narrowing in generics. */
export type defaultTestOptionsType = TestOptions & {
  useSandboxGitClient: false;
  stubBuiltPackageOutputChecks: true;
};

/** Default options for tests. Need to match with the default options type. */
export const defaultTestOptions: defaultTestOptionsType = {
  useSandboxGitClient: false,
  stubBuiltPackageOutputChecks: true,
};

/** Type describing test options with defaults merged. */
export type TestOptionsWithDefaults<O extends TestOptions> = {
  [K in keyof Required<TestOptions>]: O[K] extends boolean ? O[K] : defaultTestOptionsType[K];
};

/** Interface describing a test release action. */
export interface TestReleaseAction<
  T extends ReleaseAction = ReleaseAction,
  O extends TestOptions = defaultTestOptionsType,
> {
  active: ActiveReleaseTrains;
  instance: T;
  repo: GithubTestingRepo;
  fork: GithubTestingRepo;
  projectDir: string;
  githubConfig: GithubConfig;
  releaseConfig: ReleaseConfig;
  builtPackagesWithInfo: BuiltPackageWithInfo[];
  gitClient: O['useSandboxGitClient'] extends true ? SandboxGitClient : VirtualGitClient;
}
