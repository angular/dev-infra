/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// @ts-ignore
import tokenRaw from './browserstack_token.data';
import {k, iv, alg, at} from './constants.js';
import {createDecipheriv} from 'crypto';
import {exportVariable, setSecret} from '@actions/core';

interface BrowserStackInfoObject {
  BROWSER_STACK_USERNAME: string;
  BROWSER_STACK_ACCESS_KEY: string;
}

async function main() {
  const t: Uint8Array = tokenRaw;
  const dcip = createDecipheriv(alg, k, iv).setAuthTag(Buffer.from(at, 'base64'));
  const dec = dcip.update(t, undefined, 'utf8') + dcip.final('utf8');
  const {BROWSER_STACK_USERNAME, BROWSER_STACK_ACCESS_KEY} = JSON.parse(
    dec,
  ) as BrowserStackInfoObject;
  // Register the access key as a secret to prevent it from being logged.
  setSecret(BROWSER_STACK_ACCESS_KEY);
  // Set the borwserstack access key and username as environment variables.
  exportVariable('BROWSER_STACK_ACCESS_KEY', BROWSER_STACK_ACCESS_KEY);
  exportVariable('BROWSER_STACK_USERNAME', BROWSER_STACK_USERNAME);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
