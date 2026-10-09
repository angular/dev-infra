/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {ChildProcess} from '../child-process.js';
import {captureLogOutputForCommand} from '../logging.js';
import {cleanTestTmpDir, testTmpDir} from '../testing/index.js';

describe('captureLogOutputForCommand', () => {
  beforeEach(() => {
    cleanTestTmpDir();
    spyOn(ChildProcess, 'spawnSync').and.returnValue({
      stdout: testTmpDir,
      stderr: '',
      status: 0,
    });
  });

  it('should throw a security violation when .ng-dev.log is a symbolic link to an existing file', async () => {
    const targetPath = path.join(testTmpDir, 'existing-target.txt');
    fs.writeFileSync(targetPath, 'original content');
    fs.symlinkSync(targetPath, path.join(testTmpDir, '.ng-dev.log'));

    await expectAsync(
      captureLogOutputForCommand({$0: 'ng-dev', _: ['test']} as any),
    ).toBeRejectedWithError(
      'Security Violation: .ng-dev.log is a symbolic link. ' +
        'To prevent arbitrary file write, execution is aborted.',
    );
    expect(fs.readFileSync(targetPath, 'utf8')).toBe('original content');
  });

  it('should throw a security violation when .ng-dev.log is a dangling symbolic link', async () => {
    const targetPath = path.join(testTmpDir, 'non-existent-target.txt');
    fs.symlinkSync(targetPath, path.join(testTmpDir, '.ng-dev.log'));

    await expectAsync(
      captureLogOutputForCommand({$0: 'ng-dev', _: ['test']} as any),
    ).toBeRejectedWithError(
      'Security Violation: .ng-dev.log is a symbolic link. ' +
        'To prevent arbitrary file write, execution is aborted.',
    );
    expect(fs.existsSync(targetPath)).toBeFalse();
  });
});
