/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// @ts-ignore
import tokenRaw from './saucelabs_token.data';
import {k, iv, alg, at} from './constants.js';
import {createDecipheriv} from 'crypto';
import {exportVariable, setSecret} from '@actions/core';

interface SauceInfoObject {
  SAUCE_USERNAME: string;
  SAUCE_ACCESS_KEY: string;
}

async function main() {
  const t: Uint8Array = tokenRaw;
  const dcip = createDecipheriv(alg, k, iv).setAuthTag(Buffer.from(at, 'base64'));
  const dec = dcip.update(t, undefined, 'utf8') + dcip.final('utf8');
  const {SAUCE_USERNAME, SAUCE_ACCESS_KEY} = JSON.parse(dec) as SauceInfoObject;
  // Register the access key as a secret to prevent it from being logged.
  setSecret(SAUCE_ACCESS_KEY);
  // Set the sauce access key and username as environment variables.
  exportVariable('SAUCE_ACCESS_KEY', SAUCE_ACCESS_KEY);
  exportVariable('SAUCE_USERNAME', SAUCE_USERNAME);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
