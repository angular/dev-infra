/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';

async function main(bundleExecpath, outputExecpath) {
  const content = await fs.promises.readFile(bundleExecpath, 'utf8');
  // We need to avoid passing it through command line arguments. See:
  // https://stackoverflow.com/a/47443446.
  const output = `
node <<"NGEOF"
${content}
NGEOF
`;
  await fs.promises.writeFile(outputExecpath, output, 'utf8');
  await fs.promises.chmod(outputExecpath, 0o777);
}

try {
  const [bundleExecpath, outputExecpath] = process.argv.slice(2);
  await main(bundleExecpath, outputExecpath);
} catch (e) {
  console.error(e);
  process.exitCode = 1;
}
