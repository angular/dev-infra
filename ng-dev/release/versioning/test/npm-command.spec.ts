/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChildProcess} from '../../../utils/child-process.js';
import {NpmCommand} from '../npm-command.js';

describe('NpmCommand', () => {
  describe('publish', () => {
    it('should call npm publish with the package path and dist tag', async () => {
      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: '',
        stderr: '',
        status: 0,
      });

      await NpmCommand.publish('dist/pkg.tgz', 'latest', undefined);

      expect(spawnSpy).toHaveBeenCalledWith(
        'npm',
        ['publish', 'dist/pkg.tgz', '--access', 'public', '--tag', 'latest'],
        {mode: 'silent'},
      );
    });

    it('should pass registry option if defined', async () => {
      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: '',
        stderr: '',
        status: 0,
      });

      await NpmCommand.publish('dist/pkg.tgz', 'next', 'https://custom-registry.org');

      expect(spawnSpy).toHaveBeenCalledWith(
        'npm',
        [
          'publish',
          'dist/pkg.tgz',
          '--access',
          'public',
          '--tag',
          'next',
          '--registry',
          'https://custom-registry.org',
        ],
        {mode: 'silent'},
      );
    });

    it('should pass cwd option when provided', async () => {
      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: '',
        stderr: '',
        status: 0,
      });

      await NpmCommand.publish('/abs/dist/pkg.tgz', 'latest', undefined, '/tmp/isolated-npm-dir');

      expect(spawnSpy).toHaveBeenCalledWith(
        'npm',
        ['publish', '/abs/dist/pkg.tgz', '--access', 'public', '--tag', 'latest'],
        {mode: 'silent', cwd: '/tmp/isolated-npm-dir'},
      );
    });

    it('should pass env option when provided', async () => {
      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: '',
        stderr: '',
        status: 0,
      });
      const customEnv: NodeJS.ProcessEnv = {
        PATH: '/usr/bin',
        EXIT_GATE_AR_TOKEN: 'test-token',
      };

      await NpmCommand.publish(
        '/abs/dist/pkg.tgz',
        'latest',
        'https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/',
        '/tmp/isolated-npm-dir',
        customEnv,
      );

      expect(spawnSpy).toHaveBeenCalledWith(
        'npm',
        [
          'publish',
          '/abs/dist/pkg.tgz',
          '--access',
          'public',
          '--tag',
          'latest',
          '--registry',
          'https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/',
        ],
        {mode: 'silent', cwd: '/tmp/isolated-npm-dir', env: customEnv},
      );
    });
  });

  describe('checkVersionExists', () => {
    it('should return true if the version exists on registry', async () => {
      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: '17.0.0\n',
        stderr: '',
        status: 0,
      });

      const result = await NpmCommand.checkVersionExists(
        '@angular/core',
        '17.0.0',
        'https://registry.npmjs.org',
      );

      expect(result).toBe(true);
      expect(spawnSpy).toHaveBeenCalledWith(
        'npm',
        ['view', '@angular/core@17.0.0', 'version', '--registry', 'https://registry.npmjs.org'],
        {mode: 'silent'},
      );
    });

    it('should pass cwd option when provided', async () => {
      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: '17.0.0\n',
        stderr: '',
        status: 0,
      });

      const result = await NpmCommand.checkVersionExists(
        '@angular/core',
        '17.0.0',
        undefined,
        '/tmp/isolated-npm-dir',
      );

      expect(result).toBe(true);
      expect(spawnSpy).toHaveBeenCalledWith('npm', ['view', '@angular/core@17.0.0', 'version'], {
        mode: 'silent',
        cwd: '/tmp/isolated-npm-dir',
      });
    });

    it('should pass env option when provided', async () => {
      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: '17.0.0\n',
        stderr: '',
        status: 0,
      });
      const customEnv: NodeJS.ProcessEnv = {
        PATH: '/usr/bin',
        EXIT_GATE_AR_TOKEN: 'test-token',
      };

      const result = await NpmCommand.checkVersionExists(
        '@angular/core',
        '17.0.0',
        'https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/',
        '/tmp/isolated-npm-dir',
        customEnv,
      );

      expect(result).toBe(true);
      expect(spawnSpy).toHaveBeenCalledWith(
        'npm',
        [
          'view',
          '@angular/core@17.0.0',
          'version',
          '--registry',
          'https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/',
        ],
        {
          mode: 'silent',
          cwd: '/tmp/isolated-npm-dir',
          env: customEnv,
        },
      );
    });

    it('should return false if the version does not exist (E404)', async () => {
      spyOn(ChildProcess, 'spawn').and.callFake(() => {
        return Promise.reject('npm ERR! code E404\nnpm ERR! 404 Not Found: @angular/core@99.9.9');
      });

      const result = await NpmCommand.checkVersionExists('@angular/core', '99.9.9', undefined);

      expect(result).toBe(false);
    });

    it('should propagate other errors', async () => {
      spyOn(ChildProcess, 'spawn').and.callFake(() => {
        return Promise.reject('npm ERR! code ETIMEDOUT\nnpm ERR! network error');
      });

      try {
        await NpmCommand.checkVersionExists('@angular/core', '17.0.0', undefined);
        fail('Expected promise to be rejected');
      } catch (e) {
        expect(String(e)).toContain('ETIMEDOUT');
      }
    });
  });

  describe('deprecate', () => {
    it('should call npm deprecate without cwd or env when omitted', async () => {
      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: '',
        stderr: '',
        status: 0,
      });

      await NpmCommand.deprecate('@angular/old', '>=21.0.0', 'Deprecated package', undefined);

      expect(spawnSpy).toHaveBeenCalledWith(
        'npm',
        ['deprecate', '@angular/old@>=21.0.0', 'Deprecated package'],
        {mode: 'silent'},
      );
    });

    it('should pass registry, cwd, and env options when provided', async () => {
      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: '',
        stderr: '',
        status: 0,
      });
      const customEnv: NodeJS.ProcessEnv = {
        PATH: '/usr/bin',
        EXIT_GATE_AR_TOKEN: 'test-token',
      };

      await NpmCommand.deprecate(
        '@angular/old',
        '>=21.0.0',
        'Deprecated package',
        'https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/',
        '/tmp/isolated-npm-dir',
        customEnv,
      );

      expect(spawnSpy).toHaveBeenCalledWith(
        'npm',
        [
          'deprecate',
          '@angular/old@>=21.0.0',
          'Deprecated package',
          '--registry',
          'https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/',
        ],
        {mode: 'silent', cwd: '/tmp/isolated-npm-dir', env: customEnv},
      );
    });
  });
});
