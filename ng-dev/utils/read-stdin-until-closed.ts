/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Unique error class for failures when reading from the stdin. */
export class ReadBufferFromStdinError extends Error {}

/**
 * Reads a `Buffer` from `stdin` until the stream is closed.
 *
 * @returns a Promise resolving with the `Buffer`. Rejects with `ReadBufferFromStdinError`
 *   on unexpected read errors.
 */
export function readBufferFromStdinUntilClosed(
  input: NodeJS.ReadStream = process.stdin,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const data: Buffer[] = [];

    input.on('data', (chunk) => data.push(chunk));
    input.on('end', () => resolve(Buffer.concat(data)));
    input.on('error', () => reject(new ReadBufferFromStdinError()));
    input.on('timeout', () => reject(new ReadBufferFromStdinError('Unexpected timeout')));
  });
}
