/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {cleanTestTmpDir, testTmpDir} from '../testing/index.js';
import {Prompt} from '../prompt.js';
import {ChildProcess} from '../child-process.js';
import {
  extractNgDevVersionFromPnpmList,
  localVersion,
  verifyNgDevToolIsUpToDate,
} from '../version-check.js';

describe('extractNgDevVersionFromPnpmList', () => {
  it('should extract ng-dev version from devDependencies', () => {
    const jsonOutput = JSON.stringify([
      {
        name: '@angular/devkit-repo',
        version: '22.3.0-next.0',
        devDependencies: {
          '@angular/ng-dev': {
            from: '@angular/ng-dev',
            version: '0.0.0-cde7ad16c16f5c7dbd57b62e8b930443813484ec',
          },
        },
      },
    ]);

    expect(extractNgDevVersionFromPnpmList(jsonOutput)).toBe(
      '0.0.0-cde7ad16c16f5c7dbd57b62e8b930443813484ec',
    );
  });

  it('should extract ng-dev version from dependencies', () => {
    const jsonOutput = JSON.stringify([
      {
        name: 'my-project',
        dependencies: {
          '@angular/ng-dev': {
            from: '@angular/ng-dev',
            version: '19.0.0',
          },
        },
      },
    ]);

    expect(extractNgDevVersionFromPnpmList(jsonOutput)).toBe('19.0.0');
  });

  it('should extract ng-dev version from optionalDependencies', () => {
    const jsonOutput = JSON.stringify([
      {
        name: 'my-project',
        optionalDependencies: {
          '@angular/ng-dev': {
            from: '@angular/ng-dev',
            version: '19.1.0',
          },
        },
      },
    ]);

    expect(extractNgDevVersionFromPnpmList(jsonOutput)).toBe('19.1.0');
  });

  it('should extract ng-dev version when in a multi-project workspace', () => {
    const jsonOutput = JSON.stringify([
      {
        name: 'project-a',
        path: '/path/a',
      },
      {
        name: 'project-b',
        path: '/path/b',
        devDependencies: {
          '@angular/ng-dev': {
            from: '@angular/ng-dev',
            version: '19.2.0',
          },
        },
      },
    ]);

    expect(extractNgDevVersionFromPnpmList(jsonOutput)).toBe('19.2.0');
  });

  it('should return null if ng-dev is not present in lockfile list output', () => {
    const jsonOutput = JSON.stringify([
      {
        name: 'my-project',
        dependencies: {
          tslib: {
            from: 'tslib',
            version: '2.5.0',
          },
        },
      },
    ]);

    expect(extractNgDevVersionFromPnpmList(jsonOutput)).toBeNull();
  });

  it('should return null for invalid JSON output', () => {
    expect(extractNgDevVersionFromPnpmList('not-json')).toBeNull();
  });
});

describe('verifyNgDevToolIsUpToDate', () => {
  let spawnSpy: jasmine.Spy;

  beforeEach(() => {
    cleanTestTmpDir();
    fs.writeFileSync(
      path.join(testTmpDir, 'package.json'),
      JSON.stringify({name: 'test-project', version: '1.0.0'}),
    );

    spawnSpy = spyOn(ChildProcess, 'spawn');
  });

  it('should return true when localVersion matches expectedVersion', async () => {
    const pnpmOutput = JSON.stringify([
      {
        devDependencies: {
          '@angular/ng-dev': {
            from: '@angular/ng-dev',
            version: localVersion,
          },
        },
      },
    ]);
    spawnSpy.and.returnValue(Promise.resolve({status: 0, stdout: pnpmOutput, stderr: ''}));

    const result = await verifyNgDevToolIsUpToDate(testTmpDir);

    expect(result).toBeTrue();
    expect(spawnSpy).toHaveBeenCalledWith(
      'pnpm',
      ['list', '@angular/ng-dev', '--json', '--lockfile-only'],
      jasmine.objectContaining({cwd: testTmpDir, mode: 'silent'}),
    );
  });

  it('should return false when localVersion does not match expectedVersion', async () => {
    const pnpmOutput = JSON.stringify([
      {
        devDependencies: {
          '@angular/ng-dev': {
            from: '@angular/ng-dev',
            version: 'different-version',
          },
        },
      },
    ]);
    spawnSpy.and.returnValue(Promise.resolve({status: 0, stdout: pnpmOutput, stderr: ''}));

    const result = await verifyNgDevToolIsUpToDate(testTmpDir);

    expect(result).toBeFalse();
  });

  it('should return true if package.json name is @angular/build-tooling', async () => {
    fs.writeFileSync(
      path.join(testTmpDir, 'package.json'),
      JSON.stringify({name: '@angular/build-tooling', version: '1.0.0'}),
    );

    const result = await verifyNgDevToolIsUpToDate(testTmpDir);

    expect(result).toBeTrue();
    expect(spawnSpy).not.toHaveBeenCalled();
  });

  it('should prompt user to continue when extracting version fails and return true if confirmed', async () => {
    const originalIsTTY = process.stdin.isTTY;
    try {
      Object.defineProperty(process.stdin, 'isTTY', {value: true, configurable: true});
      spawnSpy.and.rejectWith(new Error('Process error'));
      spyOn(Prompt, 'confirm').and.returnValue(Promise.resolve(true));

      const result = await verifyNgDevToolIsUpToDate(testTmpDir);

      expect(Prompt.confirm).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Do you want to continue anyway?',
          default: false,
        }),
      );
      expect(result).toBeTrue();
    } finally {
      Object.defineProperty(process.stdin, 'isTTY', {value: originalIsTTY, configurable: true});
    }
  });

  it('should return false when extracting version fails and user declines prompt', async () => {
    const originalIsTTY = process.stdin.isTTY;
    try {
      Object.defineProperty(process.stdin, 'isTTY', {value: true, configurable: true});
      spawnSpy.and.rejectWith(new Error('Process error'));
      spyOn(Prompt, 'confirm').and.returnValue(Promise.resolve(false));

      const result = await verifyNgDevToolIsUpToDate(testTmpDir);

      expect(Prompt.confirm).toHaveBeenCalled();
      expect(result).toBeFalse();
    } finally {
      Object.defineProperty(process.stdin, 'isTTY', {value: originalIsTTY, configurable: true});
    }
  });

  it('should return false without prompting when extracting version fails in non-interactive environment', async () => {
    const originalIsTTY = process.stdin.isTTY;
    try {
      Object.defineProperty(process.stdin, 'isTTY', {value: false, configurable: true});
      spawnSpy.and.rejectWith(new Error('Process error'));
      const confirmSpy = spyOn(Prompt, 'confirm');

      const result = await verifyNgDevToolIsUpToDate(testTmpDir);

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(result).toBeFalse();
    } finally {
      Object.defineProperty(process.stdin, 'isTTY', {value: originalIsTTY, configurable: true});
    }
  });
});
