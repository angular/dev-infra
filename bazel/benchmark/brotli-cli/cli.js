/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const fs = require('fs');
const {brotliCompressSync} = require('zlib');

function main(args) {
  const output = args[0].substring('--output='.length);
  const input = args[1];
  const buffer = fs.readFileSync(input);
  fs.writeFileSync(output, brotliCompressSync(buffer));
}

if (require.main === module) {
  main(process.argv.slice(2));
}
