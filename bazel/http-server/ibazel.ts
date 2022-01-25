/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createInterface} from 'readline';
import {HttpServer} from './server';

// ibazel will write this string after a successful build.
const ibazelNotifySuccessMessage = 'IBAZEL_BUILD_COMPLETED SUCCESS';

/**
 * Sets up ibazel support for the specified server. ibazel communicates with
 * an executable over the "stdin" interface. Whenever a specific message is sent
 * over "stdin", the server can be reloaded.
 */
export function setupBazelWatcherSupport(server: HttpServer) {
  // If iBazel is not configured for this process, we do not setup the watcher.
  if (process.env['IBAZEL_NOTIFY_CHANGES'] !== 'y') {
    return;
  }

  // ibazel communicates via the stdin interface.
  const rl = createInterface({input: process.stdin, terminal: false});

  rl.on('line', (chunk: string) => {
    if (chunk === ibazelNotifySuccessMessage) {
      server.reload();
    }
  });

  rl.on('close', () => {
    // Give ibazel some time to kill this process, otherwise we exit the process manually.
    // TODO(devversion): re-check if this is still needed?
    setTimeout(() => {
      console.error('Bazel watcher did not stop the HTTP server after 5 seconds. Exiting...');
      process.exit(1);
    }, 5000);
  });
}
