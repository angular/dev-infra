/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'node:fs';
import {collectAnnotations, formatWorkflowCommands} from './failure-annotations.js';

try {
  const bepPath = process.env['BAZEL_BEP_PATH'];
  if (bepPath !== undefined && fs.existsSync(bepPath)) {
    const output = formatWorkflowCommands(collectAnnotations(fs.readFileSync(bepPath, 'utf8')));
    if (output !== '') {
      process.stdout.write(`${output}\n`);
    }
  }
} catch (e) {
  console.error('Failed to emit Bazel failure annotations:', e);
}
