/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Bucket, Storage, File} from '@google-cloud/storage';
import {Browser, ArchiveType} from './browser';
import {Platform} from './platform';
import {createTmpDir, downloadFileThroughStreaming} from './utils';

import * as path from 'path';

/** Name of the Google Cloud Storage bucket for the browser mirror. */
const MIRROR_BUCKET_NAME = 'dev-infra-mirror';

/** Gets the directory in the mirror bucket for a given browser instance. */
export function getMirrorDirectoryForBrowserInstance<T>(browser: Browser<T>): string {
  return `${browser.name}/${browser.revision}`;
}

/** Uploads a browser platform artifact to the browser mirror. */
export async function uploadArtifactToMirror(
  bucket: Bucket,
  browser: Browser<unknown>,
  platform: Platform,
  type: ArchiveType,
  sourceFile: string,
): Promise<File> {
  const versionMirrorDir = getMirrorDirectoryForBrowserInstance(browser);
  const [file] = await bucket.upload(sourceFile, {
    destination: `${versionMirrorDir}/${platform}/${type}.zip`,
    public: true,
  });

  return file;
}

/**
 * Helper function that takes an authenticated instance of the Google Cloud Storage API
 * and a browser instance. The artifacts (both driver and browser itself) will be
 * downloaded and re-uploaded to the mirror bucket in the given GCP instance.
 */
export async function uploadBrowserArtifactsToMirror(storage: Storage, browser: Browser<unknown>) {
  const bucket = storage.bucket(MIRROR_BUCKET_NAME);
  const versionMirrorDir = getMirrorDirectoryForBrowserInstance(browser);

  // Note that the `File#exists` method returns the following: `[boolean]`.
  // https://googleapis.dev/nodejs/storage/latest/global.html#FileExistsResponse.
  if ((await bucket.file(versionMirrorDir).exists())[0]) {
    throw Error('Revision is already in the mirror. Remove the artifacts if you want to retry.');
  }

  const tmpDir = await createTmpDir({template: `${browser.name}-${browser.revision}-XXXXXX`});
  const downloadTasks: Promise<{
    platform: Platform;
    filePath: string;
    type: ArchiveType;
  }>[] = [];

  for (const platform of Object.values(Platform)) {
    const driverArchiveUrl = browser.getDownloadUrl(platform, 'driver-bin');
    const browserArchiveUrl = browser.getDownloadUrl(platform, 'browser-bin');
    const driverTmpPath = path.join(tmpDir, 'driver.bin');
    const browserTmpPath = path.join(tmpDir, 'browser.bin');

    downloadTasks.push(
      downloadFileThroughStreaming(browserArchiveUrl, browserTmpPath)
        .then(() => console.info(`✅ Downloaded: ${browser.name} - ${platform} browser.`))
        .then(() => ({
          platform,
          filePath: browserTmpPath,
          type: 'browser-bin',
        })),
    );

    downloadTasks.push(
      downloadFileThroughStreaming(driverArchiveUrl, driverTmpPath)
        .then(() => console.info(`✅ Downloaded: ${browser.name} - ${platform} driver.`))
        .then(() => ({
          platform,
          filePath: driverTmpPath,
          type: 'driver-bin',
        })),
    );
  }

  const tasks = await Promise.all(downloadTasks);
  const uploadTasks: Promise<{platform: Platform; type: ArchiveType; file: File}>[] = [];

  console.info();
  console.info('Fetched all browser artifacts. Now uploading to mirror.');
  console.info();

  for (const {platform, filePath, type} of tasks) {
    uploadTasks.push(
      uploadArtifactToMirror(bucket, browser, platform, type, filePath).then((file) => {
        console.log(`✅ Uploaded: ${platform} ${type}`);
        console.log(`  -> ${file.publicUrl()}`);

        return {platform, file, type};
      }),
    );
  }

  await Promise.all(uploadTasks);

  console.info(`Uploaded ${browser.name} artifacts to the Google Cloud Storage mirror.`);
}
