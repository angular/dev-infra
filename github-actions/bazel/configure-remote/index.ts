/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// @ts-ignore
import tokenRaw from './gcp_token.data';
import {k, iv, alg, at} from './constants.js';
import {createDecipheriv} from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {exportVariable} from '@actions/core';

async function main(bazelRcPath: string | undefined) {
  const isWindows = os.platform() === 'win32';
  const t: Uint8Array = tokenRaw;
  const dcip = createDecipheriv(alg, k, iv).setAuthTag(Buffer.from(at, 'base64'));
  const dec = dcip.update(t, undefined, 'utf8') + dcip.final('utf8');

  const destPath = isWindows
    ? path.join(process.env.APPDATA!, 'gcloud/application_default_credentials.json')
    : path.join(process.env.HOME!, '.config/gcloud/application_default_credentials.json');

  await fs.promises.mkdir(path.dirname(destPath), {recursive: true});
  await fs.promises.writeFile(destPath, dec, 'utf8');

  const allowWindowsRbe = process.env['ALLOW_WINDOWS_RBE'] === 'true';
  const configMode = isWindows && !allowWindowsRbe ? 'remote-cache' : 'remote';

  if (bazelRcPath) {
    let content = await readFileGracefully(bazelRcPath);
    content += `\nbuild --config=${configMode}`;
    await fs.promises.writeFile(bazelRcPath, content, 'utf8');
  }

  // Expose application credentials as variable. This may not be necessary with the default
  // path being used for credentials, but it's helpful when we cross boundaries with e.g. WSL.
  exportVariable('GOOGLE_APPLICATION_CREDENTIALS', destPath);
}

async function readFileGracefully(filePath: string): Promise<string> {
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

main(process.env.BAZELRC_PATH).catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
