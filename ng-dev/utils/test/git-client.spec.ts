/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {GitClient} from '../git/git-client.js';
import {AuthenticatedGitClient} from '../git/authenticated-git-client.js';
import {Log} from '../logging.js';
import {mockNgDevConfig} from '../testing/index.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('GitClient validation', () => {
  let client: GitClient;
  const mockConfig = {
    github: {
      owner: 'owner',
      name: 'repo',
      mainBranchName: 'main',
    },
  };

  beforeEach(() => {
    client = new GitClient(mockConfig as any, '/tmp');
  });

  describe('hasCommit', () => {
    it('should throw error if branchName starts with hyphen', () => {
      expect(() => client.hasCommit('-invalid-branch', 'sha')).toThrowError(
        /Invalid Git reference/,
      );
    });

    it('should throw error if sha starts with hyphen', () => {
      expect(() => client.hasCommit('branch', '-invalid-sha')).toThrowError(
        /Invalid Git reference/,
      );
    });

    it('should not throw if inputs are valid', () => {
      spyOn(client, 'run').and.returnValue({stdout: ''} as any);
      expect(() => client.hasCommit('branch', 'sha')).not.toThrow();
      expect(client.run).toHaveBeenCalled();
    });
  });

  describe('checkout', () => {
    it('should throw error if branchOrRevision starts with hyphen', () => {
      expect(() => client.checkout('-invalid-ref', false)).toThrowError(/Invalid Git reference/);
    });

    it('should not throw if inputs are valid', () => {
      spyOn(client, 'runGraceful').and.returnValue({status: 0} as any);
      expect(() => client.checkout('branch', false)).not.toThrow();
      expect(client.runGraceful).toHaveBeenCalled();
    });
  });

  describe('allChangesFilesSince', () => {
    it('should throw error if shaOrRef starts with hyphen', () => {
      expect(() => client.allChangesFilesSince('-invalid-ref')).toThrowError(
        /Invalid Git reference/,
      );
    });

    it('should not throw if inputs are valid', () => {
      spyOn(client, 'runGraceful').and.returnValue({stdout: ''} as any);
      expect(() => client.allChangesFilesSince('sha')).not.toThrow();
      expect(client.runGraceful).toHaveBeenCalled();
    });
  });
});

describe('GitClient sanitization', () => {
  let gitClient: GitClient;
  let logDebugSpy: jasmine.Spy;
  let stderrWriteSpy: jasmine.Spy;
  const scriptPath = path.join(os.tmpdir(), 'mock-git-58c20eaf.sh');

  beforeEach(() => {
    // Write mock git script
    const scriptContent = `#!/bin/sh
# shift 2 to get rid of -c credential.helper=
shift 2
case "$1" in
  mock-stdout)
    echo "stdout https://user:pass@github.com"
    ;;
  mock-stderr)
    echo "stderr https://user:pass@github.com" >&2
    exit 1
    ;;
  *)
    exit 0
    ;;
esac
`;
    fs.writeFileSync(scriptPath, scriptContent);
    fs.chmodSync(scriptPath, 0o755);

    gitClient = new GitClient(mockNgDevConfig, os.tmpdir());
    (gitClient as any).gitBinPath = scriptPath; // Cast to any to override readonly

    logDebugSpy = spyOn(Log, 'debug');
    stderrWriteSpy = spyOn(process.stderr, 'write').and.callThrough();
  });

  afterEach(() => {
    if (fs.existsSync(scriptPath)) {
      fs.unlinkSync(scriptPath);
    }
  });

  describe('sanitizeConsoleOutput', () => {
    it('should redact credentials from HTTP URLs', () => {
      const input = 'Cloning into https://username:password@github.com/angular/angular.git';
      const expected = 'Cloning into https://<TOKEN>@github.com/angular/angular.git';
      expect(gitClient.sanitizeConsoleOutput(input)).toBe(expected);
    });

    it('should redact credentials from HTTP URLs without password', () => {
      const input = 'Cloning into https://token@github.com/angular/angular.git';
      const expected = 'Cloning into https://<TOKEN>@github.com/angular/angular.git';
      expect(gitClient.sanitizeConsoleOutput(input)).toBe(expected);
    });

    it('should not modify URLs without credentials', () => {
      const input = 'Cloning into https://github.com/angular/angular.git';
      expect(gitClient.sanitizeConsoleOutput(input)).toBe(input);
    });
  });

  describe('runGraceful logging sanitization', () => {
    it('should sanitize stdout in logs', () => {
      gitClient.runGraceful(['mock-stdout']);
      expect(logDebugSpy).toHaveBeenCalledWith('Stdout:', 'stdout https://<TOKEN>@github.com\n');
    });

    it('should sanitize stderr in logs and process.stderr.write', () => {
      gitClient.runGraceful(['mock-stderr']);
      expect(logDebugSpy).toHaveBeenCalledWith('Stderr:', 'stderr https://<TOKEN>@github.com\n');
      // process.stderr.write is called in runGraceful when status !== 0
      expect(stderrWriteSpy).toHaveBeenCalledWith('stderr https://<TOKEN>@github.com\n');
    });

    it('should sanitize process error in logs if spawn fails', () => {
      // Force spawn failure by pointing to non-existent path
      (gitClient as any).gitBinPath = path.join(os.tmpdir(), 'non-existent-path-58c20eaf');
      gitClient.runGraceful(['some-arg']);

      expect(logDebugSpy).toHaveBeenCalledWith('Process Error:', jasmine.stringMatching('ENOENT'));
      // If it fails to spawn, result.error.stack should also be logged if present
      // We check if "Process Error Stack:" was logged.
      const stackLogged = logDebugSpy.calls
        .all()
        .some((call) => call.args[0] === 'Process Error Stack:');
      expect(stackLogged).toBeTrue();
    });
  });
});

describe('AuthenticatedGitClient sanitization', () => {
  class TestAuthenticatedGitClient extends AuthenticatedGitClient {
    constructor(token: string, config: any) {
      super(token, 'user', config, os.tmpdir());
    }
  }

  it('should redact both token and generic URL credentials', () => {
    const client = new TestAuthenticatedGitClient('secret-token', mockNgDevConfig);
    const input =
      'Cloning into https://username:password@github.com/angular/angular.git with token secret-token';
    const expected =
      'Cloning into https://<TOKEN>@github.com/angular/angular.git with token <TOKEN>';
    expect(client.sanitizeConsoleOutput(input)).toBe(expected);
  });
});
