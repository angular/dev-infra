/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Browser} from './browser.js';
import * as path from 'path';

/** Type describing possible artifact types for browser downloads. */
export type ArtifactType = 'driver-bin' | 'browser-bin';

/** Set of known artifact extensions, including chained extensions for gzipped files. */
const KNOWN_EXTENSIONS = new Set(['zip', 'tar.gz', 'tar.bz2', 'dmg']);

/** Class describing an artifact for a browser.  */
export class BrowserArtifact {
  constructor(
    /** Instance of the browser this artifact exists for. */
    public browser: Browser<unknown>,
    /** Type of the artifact. */
    public type: ArtifactType,
    /** URL for downloading the artifact.  */
    public downloadUrl: string,
    /** Extension of the artifact. If unspecified, derived from the download URL. */
    public extension: string = detectArtifactExtension(downloadUrl),
  ) {}
}

/**
 * Gets the extension of a given artifact file, excluding the dot/period.
 *
 * Since artifact download URLs can use chained extensions as for
 * example with `.tar.gz`, we will need to keep track of known extensions
 * and start looking with the first dot/period we discover.
 */
export function detectArtifactExtension(filePath: string) {
  let tmpPath: string = filePath;
  let extension: string = '';
  let currentPart: string = '';

  // Iterate from the end of the path, finding the largest possible
  // extension substring, accounting for cases like `a/b.tmp/file.tar.gz`.
  while ((currentPart = path.extname(tmpPath)) !== '') {
    // An extension needs to be a continuous set of alphanumeric characters. This is a rather
    // strict requirement as technically extensions could contain e.g. `dashes`. In our case
    // this strictness is acceptable though as we don't expect such extensions and it makes
    // this extension detection logic more correct. e.g. the logic would not incorrectly
    // detect an extension for `firefox-97.0-linux.tar.gz` to `0-linux.tar.gz`.
    if (!/^\.[a-zA-Z0-9]+$/.test(currentPart)) {
      break;
    }

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
