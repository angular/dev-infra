/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FileAndContent} from '../interfaces';

// TODO(josephperrott): Determine how we can load the jszip package dynamically again.
import JSZip from 'jszip';

export async function generateZip(files: FileAndContent[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content, {binary: true});
  }

  return await zip.generateAsync({type: 'blob'});
}
