/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {cleanTestTmpDir, testTmpDir} from '../../utils/testing/index.js';
import {measureWorkflow} from './workflow.js';

describe('perf measureWorkflow', () => {
  let originalBazelEnv: string | undefined;
  let originalPathEnv: string | undefined;
  let originalCwd: string;

  beforeEach(() => {
    cleanTestTmpDir();
    originalBazelEnv = process.env['BAZEL'];
    originalPathEnv = process.env['PATH'];
    originalCwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (originalBazelEnv === undefined) {
      delete process.env['BAZEL'];
    } else {
      process.env['BAZEL'] = originalBazelEnv;
    }
    if (originalPathEnv === undefined) {
      delete process.env['PATH'];
    } else {
      process.env['PATH'] = originalPathEnv;
    }
  });

  it('executes bare bazel steps via the configured Bazel binary without exposing node_modules/.bin', async () => {
    const repoDir = path.join(testTmpDir, 'perf-repo');
    const repoBinDir = path.join(repoDir, 'node_modules', '.bin');
    const markerFile = path.join(repoDir, 'bazel-ran.txt');
    const otherShimMarker = path.join(repoDir, 'other-shim-ran.txt');
    fs.mkdirSync(path.join(repoDir, '.git'), {recursive: true});
    fs.mkdirSync(repoBinDir, {recursive: true});

    const localBazelBin = path.join(repoBinDir, 'bazel');
    fs.writeFileSync(localBazelBin, `#!/bin/sh\necho "$1" > "${markerFile}"\n`);
    fs.chmodSync(localBazelBin, 0o755);

    const otherRepoShim = path.join(repoBinDir, 'custom-local-tool');
    fs.writeFileSync(otherRepoShim, `#!/bin/sh\necho ran > "${otherShimMarker}"\n`);
    fs.chmodSync(otherRepoShim, 0o755);

    process.chdir(repoDir);
    process.env['BAZEL'] = localBazelBin;
    // Strip any system `bazel` from PATH while keeping `/bin` and `/usr/bin` for `/bin/sh`.
    process.env['PATH'] = [repoBinDir, '/bin', '/usr/bin'].join(path.delimiter);

    const result = await measureWorkflow({
      name: 'sample-build',
      workflow: ['bazel build //...'],
    });

    expect(result.name).toBe('sample-build');
    expect(fs.readFileSync(markerFile, 'utf8').trim()).toBe('build');

    await expectAsync(
      measureWorkflow({
        name: 'disallowed-local-shim',
        workflow: ['custom-local-tool'],
      }),
    ).toBeRejected();
    expect(fs.existsSync(otherShimMarker)).toBeFalse();
  });
});
