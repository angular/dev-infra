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
import {cleanTestTmpDir, mockNgDevConfig, testTmpDir} from '../testing/index.js';
import {spawnSync} from 'child_process';
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
    client = new GitClient(mockConfig as any, testTmpDir);
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
  let scriptPath: string;

  beforeEach(() => {
    cleanTestTmpDir();
    scriptPath = path.join(testTmpDir, 'mock-git.sh');

    // Write mock git script
    const scriptContent = `#!/bin/sh
allArgs="$@"
# shift 4 to get rid of -c credential.helper= -c core.hooksPath=
shift 4
case "$1" in
  mock-args)
    echo "$allArgs"
    ;;
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

    gitClient = new GitClient(mockNgDevConfig, testTmpDir);
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

  describe('runGraceful git arguments', () => {
    it('should disable hooks and the credential helper on every invocation', () => {
      const result = gitClient.runGraceful(['mock-args']);

      expect(result.stdout.trim()).toBe(
        '-c credential.helper= -c core.hooksPath=/dev/null mock-args',
      );
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
      (gitClient as any).gitBinPath = path.join(testTmpDir, 'non-existent-path');
      gitClient.runGraceful(['some-arg']);

      expect(logDebugSpy).toHaveBeenCalledWith('Process Error:', jasmine.stringMatching('ENOENT'));
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
      super(token, 'user', config, testTmpDir);
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

describe('GitClient executable resolution and PATH filtering', () => {
  let realGitBin: string;
  let trustedBinDir: string;

  beforeEach(() => {
    cleanTestTmpDir();
    realGitBin = process.env['GIT_BIN']!;
    trustedBinDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-dev-trusted-bin-'));

    // Expose the toolchain git binary from a trusted directory outside `testTmpDir`.
    fs.symlinkSync(realGitBin, path.join(trustedBinDir, 'git'));

    spawnSync(realGitBin, ['init'], {cwd: testTmpDir, encoding: 'utf8'});
    spawnSync(realGitBin, ['config', 'user.email', 'caretaker@angular.io'], {
      cwd: testTmpDir,
      encoding: 'utf8',
    });
    spawnSync(realGitBin, ['config', 'user.name', 'Caretaker'], {
      cwd: testTmpDir,
      encoding: 'utf8',
    });
  });

  afterEach(() => {
    fs.rmSync(trustedBinDir, {recursive: true, force: true});
  });

  it('resolves system git instead of a repository-local node_modules/.bin/git executable', () => {
    const repoBinDir = path.join(testTmpDir, 'node_modules', '.bin');
    const localMarker = path.join(testTmpDir, '.git', 'local-git-invoked');
    fs.mkdirSync(repoBinDir, {recursive: true});

    const localGitShim = path.join(repoBinDir, 'git');
    fs.writeFileSync(
      localGitShim,
      `#!/bin/sh\necho invoked > "${localMarker}"\necho LOCAL_SHIM\nexit 0\n`,
    );
    fs.chmodSync(localGitShim, 0o755);

    const envPath = [repoBinDir, trustedBinDir, process.env['PATH'] ?? ''].join(path.delimiter);
    const client = new GitClient(mockNgDevConfig, testTmpDir);
    const result = client.run(['rev-parse', '--is-inside-work-tree'], {
      env: {...process.env, PATH: envPath},
    });

    expect(result.stdout.trim()).toBe('true');
    expect(fs.existsSync(localMarker)).toBeFalse();
  });

  it('excludes repository-local node_modules/.bin entries from git subprocess PATH', () => {
    const repoBinDir = path.join(testTmpDir, 'node_modules', '.bin');
    const localMarker = path.join(testTmpDir, '.git', 'local-helper-invoked');
    const trustedMarker = path.join(testTmpDir, '.git', 'trusted-helper-invoked');
    const dummyKeyPath = path.join(trustedBinDir, 'dummy_key');
    fs.mkdirSync(repoBinDir, {recursive: true});
    fs.writeFileSync(dummyKeyPath, 'dummy');

    const localHelperShim = path.join(repoBinDir, 'ssh-keygen');
    fs.writeFileSync(localHelperShim, `#!/bin/sh\necho local > "${localMarker}"\nexit 1\n`);
    fs.chmodSync(localHelperShim, 0o755);

    const trustedHelperShim = path.join(trustedBinDir, 'ssh-keygen');
    fs.writeFileSync(trustedHelperShim, `#!/bin/sh\necho trusted > "${trustedMarker}"\nexit 1\n`);
    fs.chmodSync(trustedHelperShim, 0o755);

    const envPath = [repoBinDir, trustedBinDir, process.env['PATH'] ?? ''].join(path.delimiter);
    const client = new GitClient(mockNgDevConfig, testTmpDir);
    client.runGraceful(
      [
        '-c',
        'gpg.format=ssh',
        '-c',
        'commit.gpgsign=true',
        '-c',
        `user.signingkey=${dummyKeyPath}`,
        'commit',
        '--allow-empty',
        '-m',
        'signed commit test',
      ],
      {
        env: {...process.env, PATH: envPath},
      },
    );

    expect(fs.existsSync(localMarker)).toBeFalse();
    expect(fs.existsSync(trustedMarker)).toBeTrue();
  });

  it('re-resolves git when options.env.PATH changes and fails cleanly in worktrees when no system git exists', () => {
    const worktreeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-dev-worktree-'));
    try {
      // Simulate a Git worktree where `.git` is a regular file rather than a directory.
      fs.writeFileSync(
        path.join(worktreeDir, '.git'),
        `gitdir: ${path.join(testTmpDir, '.git')}\n`,
      );
      const repoBinDir = path.join(worktreeDir, 'node_modules', '.bin');
      const localMarker = path.join(testTmpDir, '.git', 'worktree-local-git');
      fs.mkdirSync(repoBinDir, {recursive: true});

      const localGitShim = path.join(repoBinDir, 'git');
      fs.writeFileSync(localGitShim, `#!/bin/sh\necho invoked > "${localMarker}"\nexit 0\n`);
      fs.chmodSync(localGitShim, 0o755);

      const client = new GitClient(mockNgDevConfig, worktreeDir);
      const missingResult = client.runGraceful(['status'], {env: {PATH: repoBinDir}});
      expect(missingResult.status).toBeNull();
      expect((missingResult.error as NodeJS.ErrnoException)?.code).toBe('ENOENT');
      expect(fs.existsSync(localMarker)).toBeFalse();

      // Passing a valid system PATH on a subsequent call re-resolves cleanly.
      const okResult = client.run(['rev-parse', '--is-inside-work-tree'], {
        cwd: testTmpDir,
        env: {...process.env, PATH: trustedBinDir},
      });
      expect(okResult.stdout.trim()).toBe('true');
    } finally {
      fs.rmSync(worktreeDir, {recursive: true, force: true});
    }
  });
});
