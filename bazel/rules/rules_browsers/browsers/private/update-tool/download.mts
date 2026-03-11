import {Browser, BrowserPlatform, computeExecutablePath, getDownloadUrl} from '@puppeteer/browsers';
import path from 'node:path';

import {platforms} from './platforms.mjs';
import {downloadFileThroughStreaming, sha256} from './download_helpers.mjs';

export interface BrowserBinaryInfo {
  browser: Browser;
  platform: BrowserPlatform;
  buildId: string;
  url: URL;
  sha256: string;
  namedFiles: Record<string, string>;
  excludeFilesForPerformance: string[];
}

export async function downloadAndHashBinariesForBrowser(
  tmpDir: string,
  browser: Browser,
  buildId: string,
  namedFiles: Partial<Record<BrowserPlatform, Record<string, string>>> = {},
  excludeFilesForPerformance: Partial<Record<BrowserPlatform, string[]>> = {},
): Promise<BrowserBinaryInfo[]> {
  const downloadAndHashTasks: Promise<BrowserBinaryInfo>[] = [];

  for (const platform of platforms) {
    const url = getDownloadUrl(browser, platform, buildId);
    const destination = path.join(tmpDir, `${browser}-${platform}-${buildId}`);

    const platformNamedFiles = namedFiles[platform] ?? {};
    const platformExcludePatterns = excludeFilesForPerformance[platform] ?? [];
    platformNamedFiles[browser.toUpperCase()] = computeExecutablePath({
      browser,
      platform,
      buildId: buildId,
      cacheDir: null,
    });

    downloadAndHashTasks.push(
      (async () => {
        await downloadFileThroughStreaming(url, destination);
        return {
          browser,
          platform,
          buildId,
          url,
          sha256: await sha256(destination),
          excludeFilesForPerformance: platformExcludePatterns,
          namedFiles: platformNamedFiles,
        };
      })(),
    );
  }

  return await Promise.all(downloadAndHashTasks);
}
