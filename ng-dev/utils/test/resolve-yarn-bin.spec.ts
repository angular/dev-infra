/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

import {ChildProcess} from '../child-process.js';
import {resolveYarnScriptForProject} from '../resolve-yarn-bin.js';
import {cleanTestTmpDir, testTmpDir} from '../testing/index.js';
import {Prompt} from '../prompt.js';
import {Log} from '../logging.js';

describe('resolve yarn bin', () => {
  let spawnSpy: jasmine.Spy;
  let originalTrustEnv: string | undefined;

  beforeEach(() => {
    cleanTestTmpDir();
    originalTrustEnv = process.env['NG_DEV_TRUST_YARN_PATH'];
    spawnSpy = spyOn(ChildProcess, 'spawn').and.callFake(async (cmd, args) => {
      return {stdout: '', stderr: '', status: 1} as any;
    });
  });

  afterEach(() => {
    if (originalTrustEnv === undefined) {
      delete process.env['NG_DEV_TRUST_YARN_PATH'];
    } else {
      process.env['NG_DEV_TRUST_YARN_PATH'] = originalTrustEnv;
    }
  });

  describe('with trusted local yarn path (via env)', () => {
    beforeEach(() => {
      process.env['NG_DEV_TRUST_YARN_PATH'] = '1';
    });

    it('should respect yarn 1.x configuration files', async () => {
      fs.writeFileSync(path.join(testTmpDir, '.yarnrc'), `yarn-path "./a/b/c"`);

      expect(await resolveYarnScriptForProject(testTmpDir)).toEqual({
        binary: 'node',
        args: [path.resolve(testTmpDir, 'a/b/c')],
      });
    });

    it('should respect yarn 2.x+ configuration files', async () => {
      fs.writeFileSync(path.join(testTmpDir, '.yarnrc.yml'), `yarnPath: a/b/c`);

      expect(await resolveYarnScriptForProject(testTmpDir)).toEqual({
        binary: 'node',
        args: [path.resolve(testTmpDir, 'a/b/c')],
      });
    });
  });

  describe('with NPM global binary directory', () => {
    let fakeNpmBinDir: string;

    beforeEach(() => {
      fakeNpmBinDir = path.join(testTmpDir, 'npm-global-bin');

      // Write Yarn to the test temporary directory so that it appears to be
      // resolvable from the NPM global binary directory.
      fs.mkdirSync(fakeNpmBinDir);
      fs.writeFileSync(path.join(fakeNpmBinDir, 'yarn'), '', {mode: 0o777});
      fs.writeFileSync(path.join(fakeNpmBinDir, 'yarn.cmd'), '', {mode: 0o777});
      fs.writeFileSync(path.join(fakeNpmBinDir, 'yarn.bat'), '', {mode: 0o777});

      // The `npm bin --global` command should return the fake global directory.
      spawnSpy.and.callFake(async (cmd, args) => {
        if (cmd === 'npm' && args?.[0] === 'bin') {
          return {stdout: fakeNpmBinDir, stderr: '', status: 0} as any;
        }
        return {stdout: '', stderr: '', status: 1} as any;
      });
    });

    it('should check if no config is found', async () => {
      expect(await resolveYarnScriptForProject(testTmpDir)).toEqual({
        binary: jasmine.stringContaining(fakeNpmBinDir),
        args: [],
      });
    });

    it('should check if no yarn-path is configured', async () => {
      // Write a config that does not specify a checked-in Yarn file.
      fs.writeFileSync(path.join(testTmpDir, '.yarnrc'), ``);

      expect(await resolveYarnScriptForProject(testTmpDir)).toEqual({
        binary: jasmine.stringContaining(fakeNpmBinDir),
        args: [],
      });
    });
  });

  describe('local yarn path trust validation', () => {
    let confirmSpy: jasmine.Spy;
    let warnSpy: jasmine.Spy;
    let originalStdoutIsTTY: any;
    let originalStdinIsTTY: any;

    beforeEach(() => {
      confirmSpy = spyOn(Prompt, 'confirm');
      warnSpy = spyOn(Log, 'warn');
      originalStdoutIsTTY = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
      originalStdinIsTTY = Object.getOwnPropertyDescriptor(process.stdin, 'isTTY');
    });

    afterEach(() => {
      if (originalStdoutIsTTY) {
        Object.defineProperty(process.stdout, 'isTTY', originalStdoutIsTTY);
      } else {
        delete (process.stdout as any).isTTY;
      }
      if (originalStdinIsTTY) {
        Object.defineProperty(process.stdin, 'isTTY', originalStdinIsTTY);
      } else {
        delete (process.stdin as any).isTTY;
      }
    });

    function setTTY(val: boolean) {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: val,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(process.stdin, 'isTTY', {
        value: val,
        configurable: true,
        writable: true,
      });
    }

    it('should ignore local yarn path and warn if untrusted (non-TTY, no env)', async () => {
      setTTY(false);
      fs.writeFileSync(path.join(testTmpDir, '.yarnrc.yml'), `yarnPath: a/b/c`);

      const res = await resolveYarnScriptForProject(testTmpDir);
      expect(res.binary).toEqual('yarn');
      expect(warnSpy).toHaveBeenCalledWith(jasmine.stringContaining('Ignoring local Yarn path'));
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('should prompt and respect confirmation (trust = true)', async () => {
      setTTY(true);
      confirmSpy.and.resolveTo(true);
      fs.writeFileSync(path.join(testTmpDir, '.yarnrc.yml'), `yarnPath: a/b/c`);

      expect(await resolveYarnScriptForProject(testTmpDir)).toEqual({
        binary: 'node',
        args: [path.resolve(testTmpDir, 'a/b/c')],
      });
      expect(confirmSpy).toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should prompt and respect confirmation (trust = false)', async () => {
      setTTY(true);
      confirmSpy.and.resolveTo(false);
      fs.writeFileSync(path.join(testTmpDir, '.yarnrc.yml'), `yarnPath: a/b/c`);

      const res = await resolveYarnScriptForProject(testTmpDir);
      expect(res.binary).toEqual('yarn');
      expect(confirmSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(jasmine.stringContaining('Ignoring local Yarn path'));
    });

    it('should prompt and respect confirmation when yarnPath is "."', async () => {
      setTTY(true);
      confirmSpy.and.resolveTo(false);
      fs.writeFileSync(path.join(testTmpDir, '.yarnrc.yml'), `yarnPath: .`);

      const res = await resolveYarnScriptForProject(testTmpDir);
      expect(res.binary).toEqual('yarn');
      expect(confirmSpy).toHaveBeenCalled();
    });
  });

  it('should fallback to just `yarn` and leave resolution to system', async () => {
    // Can contain legacy property on CI depending on the CI global setup
    expect(await resolveYarnScriptForProject(testTmpDir)).toEqual(
      jasmine.objectContaining({
        binary: 'yarn',
        args: jasmine.arrayContaining([]),
      }),
    );
  });
});
