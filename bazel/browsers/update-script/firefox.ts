/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Browser, ArchiveType} from './browser';
import {Platform} from './platform';

const downloadLinuxUrls = {
  'browser-bin':
    'https://ftp.mozilla.org/pub/firefox/releases/{version}/linux-x86_64/en-US/firefox-{version}.tar.bz2',
  'driver-bin':
    'https://github.com/mozilla/geckodriver/releases/download/v{version}/geckodriver-v{version}-linux64.tar.gz',
};

const downloadMacOsUrls = {
  'browser-bin':
    'https://ftp.mozilla.org/pub/firefox/releases/{version}/mac/en-US/Firefox {version}.dmg',
  'driver-bin':
    'https://github.com/mozilla/geckodriver/releases/download/v{version}/geckodriver-v{version}-macos.tar.gz',
};

/** Class providing necessary information for the firefox browser. */
export class Firefox implements Browser<string> {
  name = 'chromium';

  constructor(public revision: string, public driverVersion: string) {}

  supports(platform: Platform): boolean {
    return platform === Platform.LINUX_X64 || platform === Platform.MAC_X64;
  }

  getDownloadUrl(platform: Platform, archiveType: ArchiveType): string {
    const urlSet = platform === Platform.LINUX_X64 ? downloadLinuxUrls : downloadMacOsUrls;
    const baseUrl = urlSet[archiveType];

    return baseUrl.replace(/\{version}/g, this.revision);
  }
}
