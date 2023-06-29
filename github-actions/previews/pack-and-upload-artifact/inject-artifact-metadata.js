
import {createRequire as __cjsCompatRequire} from 'module';
const require = __cjsCompatRequire(import.meta.url);


// 
import path from "path";
import fs from "fs";

// 
var artifactMetadata = {
  "pull-number": "./__metadata__pull_number.txt",
  "build-revision": "./__metadata__build_revision.txt"
};

// 
async function main() {
  const [deployDirPath, prNumber, buildRevision] = process.argv.slice(2);
  await fs.promises.writeFile(path.join(deployDirPath, artifactMetadata["pull-number"]), prNumber);
  await fs.promises.writeFile(path.join(deployDirPath, artifactMetadata["build-revision"]), buildRevision);
}
try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
