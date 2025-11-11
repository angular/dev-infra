/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ChildProcess} from '../../utils/child-process';
import {join} from 'path';
import {tmpdir} from 'os';
import {cp, mkdtemp, rm} from 'fs/promises';
import {determineRepoBaseDirFromCwd} from '../../utils/repo-directory';
import {Log} from '../../utils/logging';

export async function checkPortability() {
  Log.debug('Copying ng-dev configuration to isolated temp directory');
  const tmpConfigDir = await mkdtemp(join(tmpdir(), 'ng-dev-config-check-'));
  const repoBaseDir = determineRepoBaseDirFromCwd();
  try {
    await cp(join(repoBaseDir, '.ng-dev'), tmpConfigDir, {recursive: true});
    Log.debug('Validating configuration loads in isolation');
    const baseConfigFile = join(tmpConfigDir, 'config.mjs');
    const {status, stderr} = await ChildProcess.exec(`node ${baseConfigFile}`, {
      cwd: tmpConfigDir,
      mode: 'silent',
    });
    if (status !== 0) {
      throw Error(stderr);
    }
  } catch (err) {
    throw err;
  } finally {
    await rm(tmpConfigDir, {recursive: true, maxRetries: 3});
  }
}
