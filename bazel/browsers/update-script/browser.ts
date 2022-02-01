/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from './platform';

/** Type describing possible archive types for browser downloads. */
export type ArchiveType = 'driver-bin' | 'browser-bin';

/** Interface describing a browser. */
export interface Browser<T> {
  name: string;
  revision: T;
  supports(platform: Platform): boolean;
  getDownloadUrl(platform: Platform, type: ArchiveType): string;
}
