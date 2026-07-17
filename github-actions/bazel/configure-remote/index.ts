/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import {exportVariable, getBooleanInput, getInput} from '@actions/core';

async function main() {
  const isWindows = os.platform() === 'win32';
  const bazelRcPath = getInput('bazelrc', {required: false, trimWhitespace: true});
  const allowWindowsRbe = getBooleanInput('allow_windows_rbe', {required: true});
  const trustedBuild = getBooleanInput('trusted_build', {required: false});
  const credential = getInput('google_credential', {required: false, trimWhitespace: true});
  const configMode = isWindows && !allowWindowsRbe ? 'remote-cache' : 'remote';

  if (bazelRcPath) {
    let content = await readFileGracefully(bazelRcPath);
    content += getBazelRcAppendix(!!credential, configMode, trustedBuild);
    await fs.promises.writeFile(bazelRcPath, content, 'utf8');
  }

  if (!credential) {
    console.warn(
      'Skipping Bazel remote execution setup because google_credential was not provided.',
    );
    if (trustedBuild) {
      console.warn('Ignoring trusted_build because google_credential was not provided.');
    }
    return;
  }

  const destPath = isWindows
    ? path.join(process.env.APPDATA!, 'gcloud/application_default_credentials.json')
    : path.join(process.env.HOME!, '.config/gcloud/application_default_credentials.json');

  await fs.promises.mkdir(path.dirname(destPath), {recursive: true});
  await fs.promises.writeFile(destPath, credential, 'utf8');

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

function getBazelRcAppendix(
  credentialProvided: boolean,
  configMode: 'remote' | 'remote-cache',
  trustedBuild: boolean,
): string {
  const lines = [''];
  if (credentialProvided) {
    lines.push(`build --config=${configMode}`);
  }
  lines.push('test --flaky_test_attempts=3');
  if (credentialProvided && trustedBuild) {
    lines.push('build --config=trusted-build');
  }

  return lines.join('\n');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
