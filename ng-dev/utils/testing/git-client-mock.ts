/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubConfig} from '../config.js';
import {SandboxGitClient} from './sandbox-git-client.js';
import {testTmpDir} from './bazel-env.js';
import {VirtualGitClient} from './virtual-git-client.js';

/** Gets a mock instance for the `GitClient` instance. */
export function getMockGitClient<T extends boolean>(
  github: GithubConfig,
  useSandboxGitClient: T,
): T extends true ? SandboxGitClient : VirtualGitClient {
  if (useSandboxGitClient) {
    // TypeScript does not infer the return type for the implementation, so we cast
    // to any. The function signature will have the proper conditional return type.
    // The Git binary path will be passed to this test process as command line argument.
    // See `ng-dev/release/publish/test/BUILD.bazel` and the `GIT_BIN_PATH` variable
    // that is exposed from the Git bazel toolchain.
    return SandboxGitClient.createInstance(process.argv[2], {github}, testTmpDir) as any;
  } else {
    return VirtualGitClient.createInstance({github});
  }
}
