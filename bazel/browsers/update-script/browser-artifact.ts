/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Browser} from './browser';
import * as path from 'path';

/** Type describing possible artifact types for browser downloads. */
export type ArtifactType = 'driver-bin' | 'browser-bin';

/** Set of known artifact extensions, including chained extensions for gzipped files. */
const KNOWN_EXTENSIONS = new Set(['zip', 'tar.gz', 'tar.bz2', 'dmg']);

/** Class describing an artifact for a browser.  */
export class BrowserArtifact {
  /** Extension of the artifact, derived from the download URL. */
  extension = getArtifactExtension(this.downloadUrl);

  constructor(
    /** Instance of the browser this artifact exists for. */
    public browser: Browser<unknown>,
    /** Type of the artifact. */
    public type: ArtifactType,
    /** URL for downloading the artifact.  */
    public downloadUrl: string,
  ) {}
}

/**
 * Gets the extension of a given artifact file, excluding the dot/period.
 *
 * Since artifact download URLs can use chained extensions as for
 * example with `.tar.gz`, we will need to keep track of known extensions
 * and start looking with the first dot/period we discover.
 */
function getArtifactExtension(filePath: string) {
  let tmpPath: string = filePath;
  let extension: string = '';
  let currentPart: string = '';

  // Iterate from the end of the path, finding the largest possible
  // extension substring, accounting for cases like `a/b.tmp/file.tar.gz`.
  while ((currentPart = path.extname(tmpPath)) !== '') {
    extension = currentPart + extension;
    tmpPath = path.basename(tmpPath, currentPart);
  }

  // Strip off the leading period/dot from the extension.
  // If there is no extension, this string would remain empty.
  extension = extension.substring(1);

  if (KNOWN_EXTENSIONS.has(extension)) {
    return extension;
  }

  throw new Error(`Unable to find known extension for file path: ${filePath}`);
}
