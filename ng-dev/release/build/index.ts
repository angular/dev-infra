/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fork} from 'child_process';
import {BuiltPackage} from '../config/index.js';

export abstract class BuildWorker {
  /**
   * Builds the release output without polluting the process stdout. Build scripts commonly
   * print messages to stderr or stdout. This is fine in most cases, but sometimes other tooling
   * reserves stdout for data transfer (e.g. when `ng release build --json` is invoked). To not
   * pollute the stdout in such cases, we launch a child process for building the release packages
   * and redirect all stdout output to the stderr channel (which can be read in the terminal).
   */
  static async invokeBuild(): Promise<BuiltPackage[] | null> {
    return new Promise((resolve) => {
      const buildProcess = fork(getBuildWorkerScriptPath(), {
        // The stdio option is set to redirect any "stdout" output directly to the "stderr" file
        // descriptor. An additional "ipc" file descriptor is created to support communication with
        // the build process. https://nodejs.org/api/child_process.html#child_process_options_stdio.
        stdio: ['inherit', 2, 2, 'ipc'],
      });
      let builtPackages: BuiltPackage[] | null = null;

      // The child process will pass the `buildPackages()` output through the
      // IPC channel. We keep track of it so that we can use it as resolve value.
      buildProcess.on(
        'message',
        (buildResponse: BuiltPackage[]) => (builtPackages = buildResponse),
      );

      // On child process exit, resolve the promise with the received output.
      buildProcess.on('exit', () => resolve(builtPackages));
    });
  }
}

/** Gets the absolute file path to the build worker script. */
function getBuildWorkerScriptPath(): string {
  // We resolve the worker script using module resolution as in the package output
  // the worker might be bundled but exposed through a subpath export mapping.
  return require.resolve('@angular/dev-infra-private/ng-dev/release/build/build-worker');
}
