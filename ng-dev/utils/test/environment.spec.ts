/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import {pathToFileURL} from 'url';
import {
  findEnclosingGitRepoRoot,
  getEmptyPathSentinel,
  getExcludedDirsForCwd,
  getPathFromEnvironment,
  isPathInsideDirectory,
  resolveSafeExecutable,
  sanitizeEnvironmentPath,
  sanitizePathString,
  sanitizeProcessEnvironmentPath,
} from '../environment.js';
import {cleanTestTmpDir, testTmpDir} from '../testing/index.js';

describe('environment PATH sanitization', () => {
  beforeEach(() => {
    cleanTestTmpDir();
  });

  it('strips repository-local entries, empty segments, and relative segments on POSIX', () => {
    const repoDir = '/workspace/angular';
    const rawPath = [
      '',
      '.',
      './tools/bin',
      'node_modules/.bin',
      '/workspace/angular/node_modules/.bin',
      '/workspace/angular/node_modules/.pnpm/node_modules/.bin',
      '/workspace/angular/packages/core/node_modules/.bin',
      '/workspace/angular',
      '/workspace/angular-other/bin',
      '/usr/local/bin',
      '/usr/bin',
      '',
    ].join(':');

    const sanitized = sanitizePathString(rawPath, [repoDir], 'linux', (p) => p);
    expect(sanitized).toBe('/workspace/angular-other/bin:/usr/local/bin:/usr/bin');
  });

  it('preserves literal double quotes on POSIX rather than unquoting segments', () => {
    const rawPath = '"/workspace/angular/node_modules/.bin":/usr/bin';
    // On POSIX, a leading quote makes the segment relative rather than unquoting to `/workspace/...`.
    expect(sanitizePathString(rawPath, [], 'linux', (p) => p)).toBe('/usr/bin');
  });

  it('strips symlinked repository PATH entries even when subdirectories do not exist yet', () => {
    const realRepoDir = path.join(testTmpDir, 'real-repo');
    const symlinkRepoDir = path.join(testTmpDir, 'symlink-repo');
    const trustedBinDir = path.join(testTmpDir, 'trusted-bin');

    fs.mkdirSync(realRepoDir, {recursive: true});
    fs.mkdirSync(trustedBinDir, {recursive: true});
    fs.symlinkSync(realRepoDir, symlinkRepoDir);

    const symlinkBin = path.join(symlinkRepoDir, 'node_modules', '.bin');
    const realBin = path.join(realRepoDir, 'node_modules', '.bin');
    const rawPath = [symlinkBin, realBin, trustedBinDir].join(path.delimiter);

    expect(sanitizePathString(rawPath, [realRepoDir])).toBe(trustedBinDir);
    expect(sanitizePathString(rawPath, [symlinkRepoDir])).toBe(trustedBinDir);
    expect(isPathInsideDirectory(symlinkBin, realRepoDir)).toBeTrue();
    expect(isPathInsideDirectory(realBin, symlinkRepoDir)).toBeTrue();
  });

  it('matches case-insensitively and normalizes Unicode NFC on macOS (darwin)', () => {
    const repoRoot = '/Users/dev/Angular';
    const mixedCaseCandidate = '/users/dev/angular/node_modules/.bin';
    const decomposedCandidate = `/Users/dev/caf\u0065\u0301/node_modules/.bin`;
    const composedRoot = `/Users/dev/caf\u00e9`;

    expect(isPathInsideDirectory(mixedCaseCandidate, repoRoot, 'darwin', (p) => p)).toBeTrue();
    expect(isPathInsideDirectory(decomposedCandidate, composedRoot, 'darwin', (p) => p)).toBeTrue();
  });

  it('handles Windows Path casing, embedded quotes, root-relative paths, and NoDefaultCurrentDirectoryInExePath', () => {
    const rawEnv: NodeJS.ProcessEnv = {
      Path: [
        '"C:\\Users\\Dev\\angular\\node_modules\\.bin"',
        'C:\\"Users\\Dev\\angular"\\node_modules\\.bin',
        'c:\\users\\dev\\angular\\packages\\cli\\node_modules\\.bin',
        '\\node_modules\\.bin',
        'C:node_modules\\.bin',
        '.\\bin',
        '',
        'C:\\Program Files\\Git\\cmd',
        'C:\\Windows\\System32',
      ].join(';'),
    };

    const sanitized = sanitizeEnvironmentPath(
      rawEnv,
      ['C:\\Users\\Dev\\angular', 'C:\\'],
      'win32',
      (p) => p,
    );

    expect(sanitized['Path']).toBe('C:\\Program Files\\Git\\cmd;C:\\Windows\\System32');
    expect(sanitized['NoDefaultCurrentDirectoryInExePath']).toBe('1');
  });

  it('substitutes a non-existent sentinel directory when all PATH segments are excluded', () => {
    const env: NodeJS.ProcessEnv = {
      PATH: '/repo/node_modules/.bin:.:',
    };

    sanitizeProcessEnvironmentPath(['/repo'], env, 'linux', (p) => p);
    expect(env['PATH']).toBe(getEmptyPathSentinel('linux'));
    expect(resolveSafeExecutable('git', {PATH: '/repo/node_modules/.bin'}, ['/repo'])).toBeNull();
  });

  it('reads exact PATH on POSIX and the last case-insensitive Path key on Windows', () => {
    const posixEnv: NodeJS.ProcessEnv = {
      Path: '/custom/ignored',
      PATH: '/usr/bin',
    };
    expect(getPathFromEnvironment(posixEnv, 'linux')).toBe('/usr/bin');

    const winEnv: NodeJS.ProcessEnv = {
      Path: 'C:\\Old\\Bin',
      PATH: 'C:\\Override\\Bin',
    };
    expect(getPathFromEnvironment(winEnv, 'win32')).toBe('C:\\Override\\Bin');
  });

  it('finds enclosing Git roots from subdirectories without stripping user home toolchains outside repos', () => {
    const repoRoot = path.join(testTmpDir, 'workspace', 'repo');
    const subDir = path.join(repoRoot, 'packages', 'core');
    fs.mkdirSync(path.join(repoRoot, '.git'), {recursive: true});
    fs.mkdirSync(subDir, {recursive: true});

    expect(findEnclosingGitRepoRoot(subDir)).toBe(repoRoot);
    const repoExcluded = getExcludedDirsForCwd(pathToFileURL(subDir), subDir);
    expect(repoExcluded).toContain(repoRoot);

    const outsideHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-dev-home-'));
    try {
      const nvmBin = path.join(outsideHome, '.nvm', 'versions', 'node', 'v22', 'bin');
      const homeNodeModulesBin = path.join(outsideHome, 'node_modules', '.bin');
      const excludedOutside = getExcludedDirsForCwd(undefined, outsideHome);

      expect(findEnclosingGitRepoRoot(outsideHome)).toBeNull();
      expect(
        sanitizePathString(
          [homeNodeModulesBin, nvmBin].join(path.delimiter),
          excludedOutside,
          'linux',
          (p) => p,
        ),
      ).toBe(nvmBin);
    } finally {
      fs.rmSync(outsideHome, {recursive: true, force: true});
    }
  });
});
