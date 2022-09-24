/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// @ts-ignore
import tokenRaw from './gcp_token.data';
import {k, iv, alg, at} from './constants';
import {createDecipheriv} from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';

async function main(bazelRcPath: string | undefined) {
  const t: Uint8Array = tokenRaw;
  const dcip = createDecipheriv(alg, k, iv).setAuthTag(Buffer.from(at, 'base64'));
  const dec = dcip.update(t, undefined, 'utf8') + dcip.final('utf8');

  const destPath =
    os.platform() === 'win32'
      ? path.join(process.env.APPDATA!, 'gcloud/application_default_credentials.json')
      : path.join(process.env.HOME!, '.config/gcloud/application_default_credentials.json');

  await fs.promises.mkdir(path.dirname(destPath), {recursive: true});
  await fs.promises.writeFile(destPath, dec, 'utf8');

  if (bazelRcPath) {
    let content = await readFileGracefully(bazelRcPath);
    content += '\nbuild --config=remote';
    await fs.promises.writeFile(bazelRcPath, content, 'utf8');
  }
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
