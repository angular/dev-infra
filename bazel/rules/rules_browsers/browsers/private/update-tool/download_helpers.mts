/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Readable} from 'node:stream';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

/**
 * Downloads a file and stores it at the given location.
 *
 * The file is downloaded asynchronously using streaming to avoid
 * increasing acquired memory of the NodeJS process unnecessarily.
 */
export async function downloadFileThroughStreaming(
  sourceUrl: URL,
  destinationPath: string,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const result = await fetch(sourceUrl);

    if (result.status !== 200) {
      reject(`Could not load: ${sourceUrl}, status: ${result.status}`);
    }
    if (result.body === null) {
      reject();
      return;
    }

    const stream = Readable.fromWeb(result.body);
    const outStream = fs.createWriteStream(destinationPath);

    stream.on('error', (err) => reject(err));
    stream.on('close', () => resolve());
    stream.pipe(outStream);
  });
}

export async function sha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    const hash = createHash('sha256');

    stream.on('error', (err) => reject(err));
    stream.on('close', () => resolve(hash.digest('hex')));
    stream.pipe(hash);
  });
}
