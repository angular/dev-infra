/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as tmp from 'tmp';
import fetch from 'node-fetch';

/** Creates a temporary directory with the given options. */
export function createTmpDir(options: tmp.DirOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    tmp.dir(options, (err, name) => (err !== null ? reject(err) : resolve(name)));
  });
}

/**
 * Downloads a file and stores it at the given location.
 *
 * The file is downloaded asynchronously using streaming to avoid
 * increasing acquired memory of the NodeJS process unnecessarily.
 */
export async function downloadFileThroughStreaming(
  sourceUrl: string,
  destinationPath: string,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const stream = (await fetch.default(sourceUrl)).body;
    const outStream = fs.createWriteStream(destinationPath);

    stream.on('error', (err) => reject(err));
    stream.on('close', () => resolve());
    stream.pipe(outStream);
  });
}
