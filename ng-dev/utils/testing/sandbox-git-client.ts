/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SpawnSyncOptions, SpawnSyncReturns} from 'child_process';
import {AuthenticatedGitClient} from '../git/authenticated-git-client.js';
import {GithubConfig} from '../config.js';
import {GitClient} from '../git/git-client.js';

/** Fake spawn sync returns value that is successful without any process output. */
const noopSpawnSyncReturns = {status: 0, stderr: '', output: [], pid: -1, signal: null, stdout: ''};

/**
 * Client that relies on the real Git binaries but operates in a sandbox-manner
 * where no network access is granted and commands are only executed in a
 * specified directory.
 */
export class SandboxGitClient extends AuthenticatedGitClient {
  static createInstance(
    gitBinPath: string,
    config: {github: GithubConfig},
    baseDir: string,
  ): SandboxGitClient {
    return new SandboxGitClient(gitBinPath, 'abc123', baseDir, config);
  }

  protected constructor(
    // Overrides the path to the Git binary.
    override gitBinPath: string,
    githubToken: string,
    baseDir?: string,
    config?: {github: GithubConfig},
  ) {
    super(githubToken, baseDir, config);
  }

  /** Override for the actual Git client command execution. */
  override runGraceful(args: string[], options: SpawnSyncOptions = {}): SpawnSyncReturns<string> {
    const command = args[0];

    // If any command refers to `FETCH_HEAD` in some way, we always
    // return the noop spawn sync value. We do not deal with remotes
    // in the sandbox client so this would always fail.
    if (args.some((v) => v.includes('FETCH_HEAD'))) {
      return noopSpawnSyncReturns;
    }

    // For the following commands, we do not run Git as those deal with
    // remotes and we do not allow this for the sandboxed environment.
    if (command === 'push' || command === 'fetch') {
      return noopSpawnSyncReturns;
    }

    return super.runGraceful(args, options);
  }
}

export function installSandboxGitClient(mockInstance: SandboxGitClient) {
  spyOn(GitClient, 'get').and.returnValue(mockInstance);
  spyOn(AuthenticatedGitClient, 'get').and.returnValue(mockInstance);
}
