/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {hashElement} from 'folder-hash';

/** Class holding methods for hashing a directory. */
export abstract class DirectoryHash {
  /** Computes a hash for the given directory. */
  static async compute(dirPath: string): Promise<string> {
    return (await hashElement(dirPath, {})).hash;
  }
}
