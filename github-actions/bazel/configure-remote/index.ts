/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// @ts-ignore-next-line strict-deps
import tokenRaw from './gcp_token.data';
import {k, iv, alg, at} from './constants.js';
import {createDecipheriv} from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {exportVariable, getBooleanInput, getInput} from '@actions/core';

async function main() {
  const isWindows = os.platform() === 'win32';
  const bazelRcPath = getInput('bazelrc', {required: false, trimWhitespace: true});
  const allowWindowsRbe = getBooleanInput('allow_windows_rbe', {required: true});
  const trustedBuild = getBooleanInput('trusted_build', {required: false});
  const credential =
    getInput('google_credential', {required: false, trimWhitespace: true}) ||
    getEmbeddedCredential();

  const destPath = isWindows
    ? path.join(process.env.APPDATA!, 'gcloud/application_default_credentials.json')
    : path.join(process.env.HOME!, '.config/gcloud/application_default_credentials.json');

  await fs.promises.mkdir(path.dirname(destPath), {recursive: true});
  await fs.promises.writeFile(destPath, credential, 'utf8');

  const configMode = isWindows && !allowWindowsRbe ? 'remote-cache' : 'remote';

  if (bazelRcPath) {
    let content = await readFileGracefully(bazelRcPath);
    content += `\nbuild --config=${configMode}`;
    if (trustedBuild) {
      content += `\nbuild --config=trusted-build`;
    }
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

/** Extract the embeeded credential from the action. */
function getEmbeddedCredential(): string {
  const t: Uint8Array = tokenRaw;
  const dcip = createDecipheriv(alg, k, iv).setAuthTag(Buffer.from(at, 'base64'));
  return dcip.update(t, undefined, 'utf8') + dcip.final('utf8');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
