/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {exportVariable, setSecret} from '@actions/core';

async function main() {
  const username = process.env.BROWSER_STACK_USERNAME;
  const accessKey = process.env.BROWSER_STACK_ACCESS_KEY;

  if (!username || !accessKey) {
    throw new Error('BROWSER_STACK_USERNAME and BROWSER_STACK_ACCESS_KEY are required');
  }

  setSecret(accessKey);
  exportVariable('BROWSER_STACK_ACCESS_KEY', accessKey);
  exportVariable('BROWSER_STACK_USERNAME', username);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
