/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BrowserPlatform} from '@puppeteer/browsers';

export const platforms: BrowserPlatform[] = [
  BrowserPlatform.LINUX,
  BrowserPlatform.MAC,
  BrowserPlatform.MAC_ARM,
  BrowserPlatform.WIN64,
];
