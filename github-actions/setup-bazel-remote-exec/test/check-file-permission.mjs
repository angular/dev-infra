/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';

const scriptAbsPath = process.argv[2];

try {
  await fs.promises.access(scriptAbsPath, fs.constants.X_OK);
} catch (e) {
  console.error(`Script at: ${scriptAbsPath} is not executable.`);
  console.error(e);
  process.exitCode = 1;
}
