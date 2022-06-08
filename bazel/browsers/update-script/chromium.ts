/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Browser} from './browser.js';
import {ArtifactType, BrowserArtifact} from './browser-artifact.js';
import {Platform} from './platform.js';

const cloudStorageArchiveUrl =
  'https://storage.googleapis.com/chromium-browser-snapshots/{platform}/{revision}/{file}';

const cloudStorageHeadRevisionUrl = `https://storage.googleapis.com/chromium-browser-snapshots/{platform}/LAST_CHANGE`;

/**
 * Map a platform to the platfrom key used by the Chromium snapshot buildbot.
 * See: https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html.
 */
const PlatformSnapshotNameMap = {
  [Platform.LINUX_X64]: 'Linux_x64',
  [Platform.MAC_X64]: 'Mac',
  [Platform.MAC_ARM64]: 'Mac_Arm',
  [Platform.WINDOWS_X64]: 'Win',
};

/** Maps a browser platform to the snapshot archive file containing the browser binary. */
const PlatformBrowserArchiveMap = {
  [Platform.LINUX_X64]: 'chrome-linux.zip',
  [Platform.MAC_X64]: 'chrome-mac.zip',
  [Platform.MAC_ARM64]: 'chrome-mac.zip',
  [Platform.WINDOWS_X64]: 'chrome-win.zip',
};

/** Maps a browser platform to the archive file containing the driver. */
const PlatformDriverArchiveMap = {
  [Platform.LINUX_X64]: 'chromedriver_linux64.zip',
  [Platform.MAC_X64]: 'chromedriver_mac64.zip',
  [Platform.MAC_ARM64]: 'chromedriver_mac64.zip',
  [Platform.WINDOWS_X64]: 'chromedriver_win32.zip',
};

/** List of supported platforms for the Chromium binaries. */
const supportedPlatforms = new Set([
  Platform.LINUX_X64,
  Platform.MAC_X64,
  Platform.MAC_ARM64,
  Platform.WINDOWS_X64,
]);

/** Class providing necessary information for the chromium browser. */
export class Chromium implements Browser<number> {
  name = 'chromium';

  constructor(public revision: number) {}

  supports(platform: Platform): boolean {
    return supportedPlatforms.has(platform);
  }

  getArtifact(platform: Platform, type: ArtifactType): BrowserArtifact {
    return new BrowserArtifact(this, type, this.getDownloadUrl(platform, type));
  }

  getDownloadUrl(platform: Platform, type: ArtifactType): string {
    return Chromium.getDownloadArtifactUrl(this.revision, platform, type);
  }

  static getDownloadArtifactUrl(revision: number, platform: Platform, type: ArtifactType): string {
    const archiveMap = type === 'driver-bin' ? PlatformDriverArchiveMap : PlatformBrowserArchiveMap;
    return cloudStorageArchiveUrl
      .replace('{platform}', PlatformSnapshotNameMap[platform])
      .replace('{revision}', `${revision}`)
      .replace('{file}', archiveMap[platform]);
  }

  static getLatestRevisionUrl(platform: Platform) {
    return cloudStorageHeadRevisionUrl.replace('{platform}', PlatformSnapshotNameMap[platform]);
  }
}
