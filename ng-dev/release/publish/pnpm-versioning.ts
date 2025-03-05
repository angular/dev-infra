/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {existsSync} from 'node:fs';

/**
 * Class that exposes helpers for fetching and using pnpm
 * based on a currently-checked out revision.
 *
 * This is useful as there is no vendoring/checking-in of specific
 * pnpm versions, so we need to automatically fetch the proper pnpm
 * version when executing commands in version branches. Keep in mind that
 * version branches may have different pnpm version ranges, and the release
 * tool should automatically be able to satisfy those.
 */
export class PnpmVersioning {
  async isUsingPnpm(repoPath: string) {
    // If there is only a pnpm lock file at the workspace root, we assume pnpm
    // is the primary package manager. We can remove such checks in the future.
    return existsSync(join(repoPath, 'pnpm-lock.yaml')) && !existsSync(join(repoPath, 'yarn.lock'));
  }

  async getPackageSpec(repoPath: string) {
    const packageJsonRaw = await readFile(join(repoPath, 'package.json'), 'utf8');
    const packageJson = JSON.parse(packageJsonRaw) as {engines?: Record<string, string>};

    const pnpmAllowedRange = packageJson?.engines?.['pnpm'] ?? 'latest';
    return `pnpm@${pnpmAllowedRange}`;
  }
}
