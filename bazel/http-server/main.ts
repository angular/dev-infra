/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as yargs from 'yargs';

import {HttpServer} from './server';
import {setupBazelWatcherSupport} from './ibazel';

const {rootPaths, historyApiFallback, enableDevUi, environmentVariables, port} = yargs(
  process.argv.slice(2),
)
  .strict()
  .option('port', {type: 'number', default: 4200})
  .option('historyApiFallback', {type: 'boolean', default: false})
  .option('rootPaths', {type: 'array', default: ['']})
  .option('environmentVariables', {type: 'array', default: []})
  .option('enableDevUi', {type: 'boolean', default: false})
  .parseSync();

// In non-test executions, we will never allow for the browser-sync dev UI.
const enableUi = process.env.TEST_TARGET === undefined && enableDevUi;
const server = new HttpServer(port, rootPaths, enableUi, historyApiFallback, environmentVariables);

// Setup ibazel support.
setupBazelWatcherSupport(server);

// Start the server. The server will always bind to the loopback and
// the public interface of the current host.
server.start();
