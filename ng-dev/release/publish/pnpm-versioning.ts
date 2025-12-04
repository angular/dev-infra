/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'node:path';
import {existsSync} from 'node:fs';

// TODO(josephperrott): Remove this version check once we no longer support v19

export class PnpmVersioning {
  static isUsingPnpm(repoPath: string) {
    // If there is only a pnpm lock file at the workspace root, we assume pnpm
    // is the primary package manager. We can remove such checks in the future.
    return existsSync(join(repoPath, 'pnpm-lock.yaml')) && !existsSync(join(repoPath, 'yarn.lock'));
  }
}
