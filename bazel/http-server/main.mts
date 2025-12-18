/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseArgs} from 'node:util';
import assert from 'node:assert';

import {HttpServer} from './server.mjs';
import {setupBazelWatcherSupport} from './ibazel.mjs';

const {values} = parseArgs({
  args: process.argv.slice(2),
  strict: true,
  allowNegative: true,
  options: {
    port: {
      type: 'string',
      default: '4200',
    },
    'history-api-fallback': {
      type: 'boolean',
      default: false,
    },
    'root-paths': {
      type: 'string',
      multiple: true,
      default: ['./'],
    },
    'environment-variables': {
      type: 'string',
      multiple: true,
      default: [],
    },
    'enable-dev-ui': {
      type: 'boolean',
      default: false,
    },
    'relax-cors': {
      type: 'boolean',
      default: false,
    },
  },
});

const {
  'root-paths': rootPaths,
  'history-api-fallback': historyApiFallback,
  'enable-dev-ui': enableDevUi,
  'environment-variables': environmentVariables,
  port: cliPort,
  'relax-cors': relaxCors,
} = values;

let port = Number(cliPort);
// Process environment port always overrides the CLI, or rule attribute-specified port.
if (process.env.PORT !== undefined) {
  port = Number(process.env.PORT);
  assert(!isNaN(port), 'Expected `PORT` environment variable to be a valid number.');
}

// In non-test executions, we will never allow for the browser-sync dev UI.
const enableUi = process.env.TEST_TARGET === undefined && enableDevUi;
const server = new HttpServer(
  port,
  rootPaths,
  enableUi,
  historyApiFallback,
  environmentVariables,
  relaxCors,
);

// Setup ibazel support.
setupBazelWatcherSupport(server);

// Start the server. The server will always bind to the loopback and
// the public interface of the current host.
server.start();
