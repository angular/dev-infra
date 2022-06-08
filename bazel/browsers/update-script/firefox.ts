/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ArtifactType, BrowserArtifact} from './browser-artifact.js';
import {Browser} from './browser.js';
import {Platform} from './platform.js';
import {detectArtifactExtension} from './browser-artifact.js';

const downloadLinuxUrls = {
  'browser-bin':
    'https://ftp.mozilla.org/pub/firefox/releases/{version}/linux-x86_64/en-US/firefox-{version}.tar.bz2',
  'driver-bin':
    'https://github.com/mozilla/geckodriver/releases/download/v{version}/geckodriver-v{version}-linux64.tar.gz',
};

const downloadMacOsX64Urls = {
  'browser-bin':
    'https://ftp.mozilla.org/pub/firefox/releases/{version}/mac/en-US/Firefox {version}.dmg',
  'driver-bin':
    'https://github.com/mozilla/geckodriver/releases/download/v{version}/geckodriver-v{version}-macos.tar.gz',
};

const downloadMacOsArm64Urls = {
  'browser-bin':
    'https://ftp.mozilla.org/pub/firefox/releases/{version}/mac/en-US/Firefox {version}.dmg',
  'driver-bin':
    'https://github.com/mozilla/geckodriver/releases/download/v{version}/geckodriver-v{version}-macos-aarch64.tar.gz',
};

/** Class providing necessary information for the firefox browser. */
export class Firefox implements Browser<string> {
  name = 'firefox';

  constructor(public revision: string, public driverVersion: string) {}

  supports(platform: Platform): boolean {
    return (
      platform === Platform.LINUX_X64 ||
      platform === Platform.MAC_X64 ||
      platform === Platform.MAC_ARM64
    );
  }

  getArtifact(platform: Platform, archiveType: ArtifactType): BrowserArtifact {
    const urlSet = this._getUrlSetForPlatform(platform);
    const baseUrl = urlSet[archiveType];
    const downloadUrl = baseUrl.replace(
      /\{version}/g,
      // Depending on browser, or driver being requested, substitute the associated version.
      archiveType === 'browser-bin' ? this.revision : this.driverVersion,
    );

    // Note that for the artifact extension we will consult the non-substituted base URL
    // as the substituted version like `97.0.tar.bz2` would throw off the detection.
    return new BrowserArtifact(this, archiveType, downloadUrl, detectArtifactExtension(baseUrl));
  }

  private _getUrlSetForPlatform(platform: Platform): Record<ArtifactType, string> {
    switch (platform) {
      case Platform.LINUX_X64:
        return downloadLinuxUrls;
      case Platform.MAC_X64:
        return downloadMacOsX64Urls;
      case Platform.MAC_ARM64:
        return downloadMacOsArm64Urls;
      default:
        throw Error(`Unexpected platform "${platform}" without Firefox support.`);
    }
  }
}
