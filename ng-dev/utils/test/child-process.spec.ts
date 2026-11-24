/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChildProcess} from '../child-process.js';
import {Log} from '../logging.js';
import {cleanTestTmpDir, testTmpDir} from '../testing/index.js';
import fs from 'fs';
import path from 'path';
import {pathToFileURL} from 'url';

describe('ChildProcess sanitization', () => {
  let debugSpy: jasmine.Spy;
  let errorSpy: jasmine.Spy;

  beforeEach(() => {
    debugSpy = spyOn(Log, 'debug');
    errorSpy = spyOn(Log, 'error');
  });

  describe('spawnInteractive', () => {
    it('should sanitize command logs', async () => {
      // We don't want to actually run an interactive process if we can avoid it,
      // but spawnInteractive returns a promise that resolves when the process exits.
      // We can run a quick command.
      await ChildProcess.spawnInteractive('node', ['-e', '', 'https://user:password@github.com']);
      expect(debugSpy).toHaveBeenCalledWith(
        'Executing command: node -e  https://<TOKEN>@github.com',
      );
    });

    it('should sanitize spawn errors on failure', async () => {
      try {
        await ChildProcess.spawnInteractive(
          `https://user:secret@example.invalid/${['ya29', 'secret_token_123'].join('.')}`,
          [],
        );
        fail('Expected spawnInteractive to reject on ENOENT');
      } catch (err) {
        const errnoErr = err as NodeJS.ErrnoException;
        expect(errnoErr).toEqual(jasmine.any(Error));
        expect(errnoErr.code).toBe('ENOENT');
        expect(errnoErr.message).toContain('https://<TOKEN>@example.invalid/<REDACTED_TOKEN>');
        expect(errnoErr.message).not.toContain('secret');
        expect(errnoErr.stack).not.toContain('secret');
        expect(debugSpy).toHaveBeenCalledWith(
          jasmine.stringContaining('https://<TOKEN>@example.invalid/<REDACTED_TOKEN>'),
        );
        for (const call of debugSpy.calls.allArgs()) {
          expect(String(call[0])).not.toContain('secret');
        }
      }
    });
  });

  describe('spawnSync', () => {
    it('should sanitize command logs', () => {
      ChildProcess.spawnSync('node', ['-e', '', 'https://user:password@github.com']);
      expect(debugSpy).toHaveBeenCalledWith(
        'Executing command: node -e  https://<TOKEN>@github.com',
      );
    });

    it('should not corrupt scoped package URLs', () => {
      ChildProcess.spawnSync('node', ['-e', '', 'https://npm.pkg.github.com/@angular/cli']);
      expect(debugSpy).toHaveBeenCalledWith(
        'Executing command: node -e  https://npm.pkg.github.com/@angular/cli',
      );
    });

    it('should sanitize URLs with empty username', () => {
      ChildProcess.spawnSync('node', ['-e', '', 'https://:password@github.com']);
      expect(debugSpy).toHaveBeenCalledWith(
        'Executing command: node -e  https://<TOKEN>@github.com',
      );
    });

    it('should sanitize thrown error message', () => {
      expect(() => {
        // Run a node script that writes to stderr and exits with 1
        ChildProcess.spawnSync('node', [
          '-e',
          'console.error("failed: https://token@github.com"); process.exit(1)',
        ]);
      }).toThrowError(/failed: https:\/\/<TOKEN>@github.com/);
    });

    it('should handle spawn failures (e.g. command not found) without throwing TypeError', () => {
      expect(() => {
        ChildProcess.spawnSync('non-existent-command-12345', []);
      }).toThrowError();
    });
  });

  describe('spawn', () => {
    it('should sanitize command logs and output', async () => {
      await ChildProcess.spawn('node', [
        '-e',
        'console.log("output: https://token@github.com"); console.error("error: https://user:pass@github.com")',
      ]);

      expect(debugSpy).toHaveBeenCalledWith(jasmine.stringContaining('Executing command: node -e'));
      // Verify command is sanitized in log
      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringContaining(
          'node -e console.log("output: https://<TOKEN>@github.com"); console.error("error: https://<TOKEN>@github.com")',
        ),
      );

      // Verify output is sanitized in log
      expect(debugSpy).toHaveBeenCalledWith(jasmine.stringContaining('Process output:'));
      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('output: https://<TOKEN>@github.com'),
      );
      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('error: https://<TOKEN>@github.com'),
      );
    });

    it('should sanitize rejected logOutput when failing in silent mode', async () => {
      try {
        await ChildProcess.spawn(
          'node',
          [
            '-e',
            'console.log("stdout: https://token@github.com"); console.error("stderr: https://user:secret@github.com"); process.exit(1)',
          ],
          {mode: 'silent'},
        );
        fail('Expected spawn to reject on non-zero exit code');
      } catch (err) {
        expect(String(err)).toContain('stdout: https://<TOKEN>@github.com');
        expect(String(err)).toContain('stderr: https://<TOKEN>@github.com');
        expect(String(err)).not.toContain('token');
        expect(String(err)).not.toContain('secret');
      }
    });

    it('should redact GCP OAuth2 access tokens in command logs and output', async () => {
      const token = ['ya29', 'a0AfH6SMB_example-token.12345'].join('.');
      await ChildProcess.spawn('node', ['-e', `console.log("token: ${token}")`], {
        mode: 'silent',
      });

      expect(debugSpy).toHaveBeenCalledWith(jasmine.stringContaining('token: <REDACTED_TOKEN>'));
      for (const call of debugSpy.calls.allArgs()) {
        expect(String(call[0])).not.toContain(token);
      }
    });

    it('should redact Authorization Bearer and Basic headers', async () => {
      await ChildProcess.spawn(
        'node',
        [
          '-e',
          'console.log("Authorization: Bearer super-secret-bearer"); console.log("authorization: basic dXNlcjpwYXNz")',
        ],
        {mode: 'silent'},
      );

      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('Authorization: Bearer <REDACTED>'),
      );
      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('authorization: basic <REDACTED>'),
      );
      for (const call of debugSpy.calls.allArgs()) {
        expect(String(call[0])).not.toContain('super-secret-bearer');
        expect(String(call[0])).not.toContain('dXNlcjpwYXNz');
      }
    });

    it('should redact .npmrc _authToken and _password directives', async () => {
      await ChildProcess.spawn(
        'node',
        [
          '-e',
          'console.log("//registry.npmjs.org/:_authToken=npm_secret123"); console.log("//registry.npmjs.org/:_password=c2VjcmV0")',
        ],
        {mode: 'silent'},
      );

      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('//registry.npmjs.org/:_authToken=<REDACTED>'),
      );
      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('//registry.npmjs.org/:_password=<REDACTED>'),
      );
      for (const call of debugSpy.calls.allArgs()) {
        expect(String(call[0])).not.toContain('npm_secret123');
        expect(String(call[0])).not.toContain('c2VjcmV0');
      }
    });

    it('should redact JWTs in command logs and output', async () => {
      const jwt =
        'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV';
      await ChildProcess.spawn('node', ['-e', `console.log("jwt: ${jwt}")`], {
        mode: 'silent',
      });

      expect(debugSpy).toHaveBeenCalledWith(jasmine.stringContaining('jwt: <REDACTED_JWT>'));
      for (const call of debugSpy.calls.allArgs()) {
        expect(String(call[0])).not.toContain(jwt);
      }
    });

    it('should redact GitHub classic and fine-grained tokens in command logs and output', async () => {
      const classicToken = ['ghp', 'a'.repeat(36)].join('_');
      const installToken = ['ghs', 'b'.repeat(36)].join('_');
      const fineGrainedPat = ['github', 'pat', 'c'.repeat(22), 'd'.repeat(59)].join('_');
      await ChildProcess.spawn(
        'node',
        [
          '-e',
          `console.log("classic: ${classicToken} install: ${installToken} pat: ${fineGrainedPat}")`,
        ],
        {mode: 'silent'},
      );

      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringContaining(
          'classic: <REDACTED_GITHUB_TOKEN> install: <REDACTED_GITHUB_TOKEN> pat: <REDACTED_GITHUB_PAT>',
        ),
      );
      for (const call of debugSpy.calls.allArgs()) {
        expect(String(call[0])).not.toContain(classicToken);
        expect(String(call[0])).not.toContain(installToken);
        expect(String(call[0])).not.toContain(fineGrainedPat);
      }
    });

    it('should suppress Process output logging when sensitiveOutput is true', async () => {
      const result = await ChildProcess.spawn(
        'node',
        ['-e', 'process.stdout.write("sensitive-" + "raw-secret")'],
        {mode: 'silent', sensitiveOutput: true},
      );

      expect(result.stdout).toBe('sensitive-raw-secret');
      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/Command ".*" completed with exit code "0"\./),
      );
      for (const call of debugSpy.calls.allArgs()) {
        expect(String(call[0])).not.toContain('Process output:');
        expect(String(call[0])).not.toContain('sensitive-raw-secret');
      }
    });

    it('should suppress Process output logging on error when sensitiveOutput is true', async () => {
      try {
        await ChildProcess.spawn(
          'node',
          ['-e', 'console.error("sensitive-" + "error-secret"); process.exit(1)'],
          {mode: 'on-error', sensitiveOutput: true},
        );
        fail('Expected spawn to reject on non-zero exit code');
      } catch {
        // Expected rejection.
      }

      expect(errorSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/Command ".*" completed with exit code "1"\./),
      );
      for (const call of [...debugSpy.calls.allArgs(), ...errorSpy.calls.allArgs()]) {
        expect(String(call[0])).not.toContain('Process output:');
        expect(String(call[0])).not.toContain('sensitive-error-secret');
      }
    });

    it('should sanitize error fields and logs on spawn error events', async () => {
      try {
        await ChildProcess.spawn(
          `https://user:secret@example.invalid/${['ya29', 'secret_token_123'].join('.')}`,
          ['--header', 'Authorization: Bearer top-secret-token'],
          {mode: 'on-error'},
        );
        fail('Expected spawn to reject on ENOENT');
      } catch (err) {
        const errnoErr = err as NodeJS.ErrnoException & {spawnargs?: string[]};
        expect(errnoErr).toEqual(jasmine.any(Error));
        expect(errnoErr.code).toBe('ENOENT');
        expect(errnoErr.message).toContain('https://<TOKEN>@example.invalid/<REDACTED_TOKEN>');
        expect(errnoErr.message).not.toContain('secret');
        expect(errnoErr.stack).not.toContain('secret');
        expect(errnoErr.path).toContain('https://<TOKEN>@example.invalid/<REDACTED_TOKEN>');
        expect(errnoErr.path).not.toContain('secret');
        expect(errnoErr.syscall).not.toContain('secret');
        expect(errnoErr.spawnargs?.join(' ')).toContain('Authorization: Bearer <REDACTED>');
        expect(errnoErr.spawnargs?.join(' ')).not.toContain('top-secret-token');

        expect(errorSpy).toHaveBeenCalledWith(
          jasmine.stringContaining('https://<TOKEN>@example.invalid/<REDACTED_TOKEN>'),
        );
        for (const call of [...debugSpy.calls.allArgs(), ...errorSpy.calls.allArgs()]) {
          expect(String(call[0])).not.toContain('secret');
          expect(String(call[0])).not.toContain('top-secret-token');
        }
      }
    });
  });

  describe('exec', () => {
    it('should sanitize command logs and output', async () => {
      // For exec, the command is a single string
      const command = 'node -e "console.log(\'output: https://token@github.com\')"';
      await ChildProcess.exec(command);

      expect(debugSpy).toHaveBeenCalledWith(
        'Executing command: node -e "console.log(\'output: https://<TOKEN>@github.com\')"',
      );
      expect(debugSpy).toHaveBeenCalledWith(jasmine.stringContaining('Process output:'));
      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('output: https://<TOKEN>@github.com'),
      );
    });
  });

  describe('PATH sanitization', () => {
    beforeEach(() => {
      cleanTestTmpDir();
    });

    it('strips cwd-local and ancestor repository node_modules/.bin entries across spawnSync, spawn, and exec', async () => {
      const repoDir = path.join(testTmpDir, 'repo');
      const subDir = path.join(repoDir, 'packages', 'core');
      const repoBinDir = path.join(repoDir, 'node_modules', '.bin');
      fs.mkdirSync(path.join(repoDir, '.git'), {recursive: true});
      fs.mkdirSync(subDir, {recursive: true});
      fs.mkdirSync(repoBinDir, {recursive: true});
      const envPath = [repoBinDir, process.env['PATH'] ?? ''].join(path.delimiter);

      const syncRes = ChildProcess.spawnSync('node', ['-e', 'console.log(process.env.PATH)'], {
        cwd: subDir,
        env: {...process.env, PATH: envPath},
        mode: 'silent',
      });
      expect(syncRes.stdout.trim().split(path.delimiter)).not.toContain(repoBinDir);

      const asyncRes = await ChildProcess.spawn('node', ['-e', 'console.log(process.env.PATH)'], {
        cwd: pathToFileURL(subDir),
        env: {...process.env, PATH: envPath},
        mode: 'silent',
      });
      expect(asyncRes.stdout.trim().split(path.delimiter)).not.toContain(repoBinDir);

      const execRes = await ChildProcess.exec('node -e "console.log(process.env.PATH)"', {
        cwd: subDir,
        env: {...process.env, PATH: envPath},
        mode: 'silent',
      });
      expect(execRes.stdout.trim().split(path.delimiter)).not.toContain(repoBinDir);
    });
  });
});
