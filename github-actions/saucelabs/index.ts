/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {exportVariable, setSecret} from '@actions/core';

async function main() {
  const username = process.env.SAUCE_USERNAME;
  const accessKey = process.env.SAUCE_ACCESS_KEY;

  if (!username || !accessKey) {
    throw new Error('SAUCE_USERNAME and SAUCE_ACCESS_KEY are required');
  }

  setSecret(accessKey);
  exportVariable('SAUCE_ACCESS_KEY', accessKey);
  exportVariable('SAUCE_USERNAME', username);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
