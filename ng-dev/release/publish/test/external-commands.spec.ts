/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import os from 'os';
import {ExternalCommands} from '../external-commands.js';
import {ChildProcess} from '../../../utils/child-process.js';
import {cleanTestTmpDir, testTmpDir} from '../../../utils/testing/index.js';
import {Log} from '../../../utils/logging.js';

describe('ExternalCommands.invokeNvmInstall', () => {
  let originalPath: string | undefined;
  let homedirSpy: jasmine.Spy;
  let logErrorSpy: jasmine.Spy;

  beforeEach(() => {
    cleanTestTmpDir();
    originalPath = process.env['PATH'];
    homedirSpy = spyOn(os, 'homedir').and.returnValue('/home/fake-user');
    logErrorSpy = spyOn(Log, 'error');
    spyOn(Log, 'debug');
  });

  afterEach(() => {
    if (originalPath !== undefined) {
      process.env['PATH'] = originalPath;
    } else {
      delete process.env['PATH'];
    }
  });

  function expectLogErrorContaining(expectedMessage: string) {
    const calls = logErrorSpy.calls.allArgs();
    const found = calls.some((args) => {
      const arg = args[0];
      if (arg instanceof Error) {
        return arg.message.includes(expectedMessage);
      }
      if (typeof arg === 'string') {
        return arg.includes(expectedMessage);
      }
      return false;
    });
    expect(found).toBe(
      true,
      `Expected log error containing "${expectedMessage}" but it was not found.`,
    );
  }

  it('should succeed with valid .nvmrc and valid resolved path', async () => {
    fs.writeFileSync(path.join(testTmpDir, '.nvmrc'), '18.0.0');

    const spawnSpy = spyOn(ChildProcess, 'spawn').and.callFake((cmd, args, options) => {
      if (typeof cmd === 'string' && cmd.includes('nvm which')) {
        return Promise.resolve({
          stdout: '/home/fake-user/.nvm/versions/node/v18.0.0/bin/node\n',
          stderr: '',
          status: 0,
        }) as any;
      }
      if (cmd === 'node' && args?.[0] === '--version') {
        return Promise.resolve({stdout: 'v18.0.0\n', stderr: '', status: 0}) as any;
      }
      return Promise.reject(new Error(`Unexpected spawn call: ${cmd}`));
    });

    await expectAsync(ExternalCommands.invokeNvmInstall(testTmpDir, true)).toBeResolved();

    expect(spawnSpy).toHaveBeenCalledTimes(2);
    expect(process.env['PATH']).toContain('/home/fake-user/.nvm/versions/node/v18.0.0/bin');
  });

  it('should fail if .nvmrc contains path traversal (../)', async () => {
    fs.writeFileSync(path.join(testTmpDir, '.nvmrc'), '../../evil');

    await expectAsync(ExternalCommands.invokeNvmInstall(testTmpDir, true)).toBeRejected();
    expectLogErrorContaining('Invalid .nvmrc content: contains path traversal characters');
  });

  it('should fail if .nvmrc contains path traversal (/)', async () => {
    fs.writeFileSync(path.join(testTmpDir, '.nvmrc'), '/evil');

    await expectAsync(ExternalCommands.invokeNvmInstall(testTmpDir, true)).toBeRejected();
    expectLogErrorContaining('Invalid .nvmrc content: contains path traversal characters');
  });

  it('should fail if .nvmrc contains invalid characters', async () => {
    fs.writeFileSync(path.join(testTmpDir, '.nvmrc'), '18.0.0; evil_command');

    await expectAsync(ExternalCommands.invokeNvmInstall(testTmpDir, true)).toBeRejected();
    expectLogErrorContaining('Invalid .nvmrc content: does not match valid version pattern');
  });

  it('should fail if resolved path is outside home directory', async () => {
    fs.writeFileSync(path.join(testTmpDir, '.nvmrc'), '18.0.0');

    spyOn(ChildProcess, 'spawn').and.callFake((cmd, args, options) => {
      if (typeof cmd === 'string' && cmd.includes('nvm which')) {
        return Promise.resolve({
          stdout: '/usr/bin/node\n', // outside /home/fake-user
          stderr: '',
          status: 0,
        }) as any;
      }
      return Promise.reject(new Error(`Unexpected spawn call: ${cmd}`));
    });

    await expectAsync(ExternalCommands.invokeNvmInstall(testTmpDir, true)).toBeRejected();
    expectLogErrorContaining('Security Error: Resolved Node.js path is outside the home directory');
  });

  it('should fail if resolved path is inside project directory', async () => {
    const parentDir = path.dirname(testTmpDir);
    homedirSpy.and.returnValue(parentDir);

    fs.writeFileSync(path.join(testTmpDir, '.nvmrc'), '18.0.0');

    const maliciousNodePath = path.join(testTmpDir, 'evil/bin/node');

    spyOn(ChildProcess, 'spawn').and.callFake((cmd, args, options) => {
      if (typeof cmd === 'string' && cmd.includes('nvm which')) {
        return Promise.resolve({
          stdout: `${maliciousNodePath}\n`,
          stderr: '',
          status: 0,
        }) as any;
      }
      return Promise.reject(new Error(`Unexpected spawn call: ${cmd}`));
    });

    await expectAsync(ExternalCommands.invokeNvmInstall(testTmpDir, true)).toBeRejected();
    expectLogErrorContaining(
      'Security Error: Resolved Node.js path is inside the project directory',
    );
  });
});
