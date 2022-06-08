/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

import {ChildProcess} from '../child-process.js';
import {resolveYarnScriptForProject} from '../resolve-yarn-bin.js';
import {testTmpDir} from '../testing/index.js';

describe('resolve yarn bin', () => {
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
      spyOn(ChildProcess, 'spawn').and.resolveTo({stdout: fakeNpmBinDir, stderr: '', status: 0});
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

  it('should fallback to just `yarn` and leave resolution to system', async () => {
    expect(await resolveYarnScriptForProject(testTmpDir)).toEqual({
      binary: 'yarn',
      args: [],
    });
  });
});
