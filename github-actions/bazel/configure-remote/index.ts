/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import {exportVariable} from '@actions/core';

async function main() {
  const isWindows = os.platform() === 'win32';
  const bazelRcPath = process.env.BAZELRC;
  const allowWindowsRbe = process.env.ALLOW_WINDOWS_RBE === 'true';
  const trustedBuild = process.env.TRUSTED_BUILD === 'true';
  const credential = process.env.GOOGLE_CREDENTIAL;

  if (!credential) {
    throw new Error('GOOGLE_CREDENTIAL is required');
  }

  const destPath = isWindows
    ? path.join(process.env.APPDATA!, 'gcloud/application_default_credentials.json')
    : path.join(process.env.HOME!, '.config/gcloud/application_default_credentials.json');

  await fs.promises.mkdir(path.dirname(destPath), {recursive: true});
  await fs.promises.writeFile(destPath, credential, 'utf8');

  const configMode = isWindows && !allowWindowsRbe ? 'remote-cache' : 'remote';

  if (bazelRcPath) {
    let content = await readFileGracefully(bazelRcPath);
    content += ['', `build --config=${configMode}`, 'test --flaky_test_attempts=3'].join('\n');
    if (trustedBuild) {
      content += `\nbuild --config=trusted-build`;
    }
    await fs.promises.writeFile(bazelRcPath, content, 'utf8');
  }

  exportVariable('GOOGLE_APPLICATION_CREDENTIALS', destPath);
}

async function readFileGracefully(filePath: string): Promise<string> {
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
