/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChildProcess} from '../child-process.js';
import {Log} from '../logging.js';

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
});
