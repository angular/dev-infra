/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Bucket, Storage, File} from '@google-cloud/storage';
import {Browser} from './browser.js';
import {Platform} from './platform.js';
import {createTmpDir, downloadFileThroughStreaming} from './utils.js';

import * as path from 'path';
import {BrowserArtifact} from './browser-artifact.js';

/** Name of the Google Cloud Storage bucket for the browser mirror. */
const MIRROR_BUCKET_NAME = 'dev-infra-mirror';

/** Gets the directory in the mirror bucket for a given browser instance. */
export function getMirrorDirectoryForBrowserInstance<T>(browser: Browser<T>): string {
  return `${browser.name}/${browser.revision}`;
}

/** Gets the destination file path for a given browser artifact. */
export function getDestinationFilePath(artifact: BrowserArtifact, platform: Platform): string {
  const versionMirrorDir = getMirrorDirectoryForBrowserInstance(artifact.browser);
  return `${versionMirrorDir}/${platform}/${artifact.type}.${artifact.extension}`;
}

/**
 * Uploads a browser platform artifact to the browser mirror.
 *
 * @throws {Error} An error if the artifact already exists in the mirror.
 */
export async function uploadArtifactToMirror(
  bucket: Bucket,
  artifact: BrowserArtifact,
  platform: Platform,
  sourceFile: string,
): Promise<File> {
  const [file] = await bucket.upload(sourceFile, {
    destination: getDestinationFilePath(artifact, platform),
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
  const tmpDir = await createTmpDir({template: `${browser.name}-${browser.revision}-XXXXXX`});
  const downloadTasks: Promise<{
    platform: Platform;
    filePath: string;
    artifact: BrowserArtifact;
  }>[] = [];

  for (const platform of Object.values(Platform)) {
    if (!browser.supports(platform)) {
      continue;
    }

    const driverArtifact = browser.getArtifact(platform, 'driver-bin');
    const browserArtifact = browser.getArtifact(platform, 'browser-bin');
    const driverTmpPath = path.join(tmpDir, `${platform}-driver.${driverArtifact.extension}`);
    const browserTmpPath = path.join(tmpDir, `${platform}-browser.${browserArtifact.extension}`);

    // We use the driver artifact (which is usually much smaller) to run a quick
    // sanity check upstream to ensure that the artifact does not yet exist upstream.
    const testDestinationFile = getDestinationFilePath(driverArtifact, platform);
    // Note that we cannot check directly for the directory to exist since GCP does
    // not support this. Hence we need to run this check for the actual files instead.
    if ((await bucket.file(testDestinationFile).exists())[0]) {
      throw Error('Revision is already in the mirror. Remove the artifacts if you want to retry.');
    }

    downloadTasks.push(
      downloadFileThroughStreaming(browserArtifact.downloadUrl, browserTmpPath)
        .then(() => console.info(`✅ Downloaded: ${browser.name} - ${platform} browser.`))
        .then(() => ({
          platform,
          filePath: browserTmpPath,
          artifact: browserArtifact,
        })),
    );

    downloadTasks.push(
      downloadFileThroughStreaming(driverArtifact.downloadUrl, driverTmpPath)
        .then(() => console.info(`✅ Downloaded: ${browser.name} - ${platform} driver.`))
        .then(() => ({
          platform,
          filePath: driverTmpPath,
          artifact: driverArtifact,
        })),
    );
  }

  const tasks = await Promise.all(downloadTasks);
  const uploadTasks: Promise<{platform: Platform; artifact: BrowserArtifact; file: File}>[] = [];

  console.info();
  console.info('Fetched all browser artifacts. Now uploading to mirror.');
  console.info();

  for (const {platform, filePath, artifact} of tasks) {
    uploadTasks.push(
      uploadArtifactToMirror(bucket, artifact, platform, filePath).then((file) => {
        console.log(`✅ Uploaded: ${platform} ${artifact.type}`);
        console.log(`  -> ${file.publicUrl()}`);

        return {platform, file, artifact};
      }),
    );
  }

  await Promise.all(uploadTasks);

  console.info(`Uploaded ${browser.name} artifacts to the Google Cloud Storage mirror.`);
}
