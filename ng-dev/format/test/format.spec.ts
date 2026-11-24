/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';
import {join} from 'path';

import {ChildProcess} from '../../utils/child-process.js';
import {setConfig} from '../../utils/config.js';
import {GitClient} from '../../utils/git/git-client.js';
import {Log} from '../../utils/logging.js';
import {Prompt} from '../../utils/prompt.js';
import {cleanTestTmpDir, testTmpDir} from '../../utils/testing/index.js';
import {checkFiles, formatFiles} from '../format.js';
import {findFirstDifferingLine} from '../formatters/base-formatter.js';
import {Buildifier} from '../formatters/buildifier.js';
import {Prettier} from '../formatters/prettier.js';

describe('ng-dev format line reporting', () => {
  const fakeGit = {baseDir: '/repo'} as GitClient;

  beforeEach(() => {
    cleanTestTmpDir();
  });

  afterEach(() => {
    cleanTestTmpDir();
    setConfig(null);
  });

  describe('findFirstDifferingLine', () => {
    it('returns undefined when contents are identical', () => {
      expect(findFirstDifferingLine('const a = 1;\n', 'const a = 1;\n')).toBeUndefined();
      expect(findFirstDifferingLine('', '')).toBeUndefined();
    });

    it('returns the 1-based line number of the first differing line', () => {
      const original = ['const a = 1;', 'const b = 2;', 'const c =   3;', 'const d = 4;', ''].join(
        '\n',
      );
      const formatted = ['const a = 1;', 'const b = 2;', 'const c = 3;', 'const d = 4;', ''].join(
        '\n',
      );
      expect(findFirstDifferingLine(original, formatted)).toBe(3);
    });

    it('reports the first extra blank line at EOF', () => {
      expect(findFirstDifferingLine('a\nb\n\n', 'a\nb\n')).toBe(3);
      expect(findFirstDifferingLine('a\nb\n\n\n', 'a\nb\n')).toBe(3);
    });

    it('clamps missing trailing newline to the last existing line', () => {
      expect(
        findFirstDifferingLine('const a = 1;\nconst b = 2;', 'const a = 1;\nconst b = 2;\n'),
      ).toBe(2);
    });

    it('clamps appended lines to the last existing line in the original file', () => {
      expect(findFirstDifferingLine('a\n', 'a\nb\n')).toBe(1);
      expect(findFirstDifferingLine('', 'a\n')).toBe(1);
    });

    it('detects CRLF vs LF differences on the exact offending line', () => {
      expect(
        findFirstDifferingLine('const a = 1;\nconst b = 2;\r\n', 'const a = 1;\nconst b = 2;\n'),
      ).toBe(2);
    });
  });

  describe('Prettier.getFailureLine', () => {
    let prettier: Prettier;

    beforeEach(() => {
      spyOn(ChildProcess, 'spawnSync').and.returnValue({
        stdout: '/repo/.prettierrc\n',
        stderr: '',
        status: 0,
      });
      prettier = new Prettier(fakeGit, {prettier: true, buildifier: false});
    });

    it('extracts the line number from syntax errors in stderr', async () => {
      const stderr = [
        '[error] src/bad.ts: SyntaxError: Unexpected token (12:5)',
        '[error] > 12 | const x = ;',
      ].join('\n');

      expect(await prettier.getFailureLine('src/bad.ts', 'check', 2, '', stderr)).toBe(12);
      expect(await prettier.getFailureLine('src/bad.ts', 'format', 2, '', stderr)).toBe(12);
    });

    it('finds the first differing line by formatting the file on check failures', async () => {
      const filePath = join(testTmpDir, 'sample.ts');
      writeFileSync(filePath, 'const a = 1;\nconst b = 2;\nconst c =   3;\n');

      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: 'const a = 1;\nconst b = 2;\nconst c = 3;\n',
        stderr: '',
        status: 0,
      });

      expect(await prettier.getFailureLine(filePath, 'check', 1, '', '[warn] sample.ts')).toBe(3);
      expect(spawnSpy).toHaveBeenCalledWith(
        '/repo/node_modules/.bin/prettier',
        ['--config', '/repo/.prettierrc', '--', filePath],
        {suppressErrorOnFailingExitCode: true, mode: 'silent'},
      );
    });

    it('returns undefined when secondary formatting fails or action is format without line info', async () => {
      const filePath = join(testTmpDir, 'sample.ts');
      writeFileSync(filePath, 'const a = 1;\n');

      spyOn(ChildProcess, 'spawn').and.resolveTo({stdout: '', stderr: 'failed', status: 2});

      expect(await prettier.getFailureLine(filePath, 'check', 1, '', '')).toBeUndefined();
      expect(
        await prettier.getFailureLine(filePath, 'format', 1, '', 'generic error'),
      ).toBeUndefined();
    });
  });

  describe('Buildifier.getFailureLine', () => {
    let buildifier: Buildifier;

    beforeEach(() => {
      buildifier = new Buildifier(fakeGit, {prettier: false, buildifier: true});
    });

    it('extracts the line number from syntax errors in stderr', async () => {
      const stderr = 'packages/BUILD.bazel:9:1: syntax error near )';
      expect(await buildifier.getFailureLine('packages/BUILD.bazel', 'check', 1, '', stderr)).toBe(
        9,
      );
      expect(await buildifier.getFailureLine('packages/BUILD.bazel', 'format', 1, '', stderr)).toBe(
        9,
      );
    });

    it('extracts the earliest lint warning line from buildifier JSON output', async () => {
      const jsonStdout = JSON.stringify({
        success: false,
        files: [
          {
            formatted: true,
            valid: true,
            warnings: [{start: {line: 14}}, {start: {line: 6}}],
          },
        ],
      });
      const spawnSpy = spyOn(ChildProcess, 'spawn');

      expect(await buildifier.getFailureLine('BUILD.bazel', 'check', 4, jsonStdout, '')).toBe(6);
      expect(spawnSpy).not.toHaveBeenCalled();
    });

    it('picks the earliest line across formatting diffs and lint warnings', async () => {
      const filePath = join(testTmpDir, 'BUILD.bazel');
      writeFileSync(
        filePath,
        'load("//tools:defs.bzl", "my_rule")\n\nmy_rule(\n    name="a",\n)\n',
      );
      const jsonStdout = JSON.stringify({
        success: false,
        files: [
          {
            formatted: false,
            valid: true,
            warnings: [{start: {line: 10}}],
          },
        ],
      });

      const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
        stdout: 'load("//tools:defs.bzl", "my_rule")\n\nmy_rule(\n    name = "a",\n)\n',
        stderr: '',
        status: 0,
      });

      expect(await buildifier.getFailureLine(filePath, 'check', 4, jsonStdout, '')).toBe(4);
      expect(spawnSpy).toHaveBeenCalledWith(
        '/repo/node_modules/.bin/buildifier',
        ['--mode=print_if_changed', '--', filePath],
        {suppressErrorOnFailingExitCode: true, mode: 'silent'},
      );
    });

    it('handles whitespace-only files that format to empty string', async () => {
      const filePath = join(testTmpDir, 'BUILD.bazel');
      writeFileSync(filePath, '   \n');
      const jsonStdout = JSON.stringify({
        success: false,
        files: [{formatted: false, valid: true, warnings: []}],
      });
      spyOn(ChildProcess, 'spawn').and.resolveTo({stdout: '', stderr: '', status: 0});

      expect(await buildifier.getFailureLine(filePath, 'check', 4, jsonStdout, '')).toBe(1);
    });

    it('returns undefined when buildifier JSON output cannot be parsed', async () => {
      expect(
        await buildifier.getFailureLine('BUILD.bazel', 'check', 1, 'not-json', ''),
      ).toBeUndefined();
    });
  });

  describe('checkFiles and formatFiles output', () => {
    let warnSpy: jasmine.Spy;
    let errorSpy: jasmine.Spy;
    let infoSpy: jasmine.Spy;

    beforeEach(() => {
      setConfig({format: {prettier: true}});
      spyOn(GitClient, 'get').and.resolveTo(fakeGit);
      spyOn(ChildProcess, 'spawnSync').and.returnValue({
        stdout: '/repo/.prettierrc\n',
        stderr: '',
        status: 0,
      });
      spyOn(Prompt, 'confirm').and.resolveTo(false);
      warnSpy = spyOn(Log, 'warn');
      errorSpy = spyOn(Log, 'error');
      infoSpy = spyOn(Log, 'info');
    });

    it('prints file:line in checkFiles and omits :line from the follow-up format command', async () => {
      const fileWithLine = join(testTmpDir, 'with-line.ts');
      const fileWithoutLine = join(testTmpDir, 'without-line.ts');
      writeFileSync(fileWithLine, 'const a = 1;\nconst b =   2;\n');
      writeFileSync(fileWithoutLine, 'const x = 1;\n');

      spyOn(ChildProcess, 'spawn').and.callFake(async (_cmd, args) => {
        const target = args[args.length - 1];
        if (args.includes('--check')) {
          return {stdout: '', stderr: `[warn] ${target}`, status: 1};
        }
        if (target === fileWithLine) {
          return {stdout: 'const a = 1;\nconst b = 2;\n', stderr: '', status: 0};
        }
        return {stdout: '', stderr: 'unexpected failure', status: 2};
      });

      const status = await checkFiles([fileWithLine, fileWithoutLine]);
      expect(status).toBe(1);

      const warnMessages = warnSpy.calls.allArgs().map((args) => args[0]);
      expect(warnMessages).toContain('\nThe following files are out of format:');
      expect(warnMessages).toContain(`  • ${fileWithLine}:2: File is out of format`);
      expect(warnMessages).toContain(`  • ${fileWithoutLine}: File is out of format`);

      const infoMessages = infoSpy.calls.allArgs().map((args) => args[0]);
      const formatCommandLine = infoMessages.find(
        (msg) => typeof msg === 'string' && msg.includes('pnpm ng-dev format files'),
      );
      expect(formatCommandLine).toBeDefined();
      expect(formatCommandLine).toContain(fileWithLine);
      expect(formatCommandLine).toContain(fileWithoutLine);
      expect(formatCommandLine).not.toContain(`${fileWithLine}:2`);
    });

    it('prints file:line: message on stderr in formatFiles when formatting fails', async () => {
      const badFile = join(testTmpDir, 'syntax-error.ts');
      writeFileSync(badFile, 'const a = 1;\nconst b = ;\n');
      const stderr = `[error] ${badFile}: SyntaxError: Unexpected token (2:11)`;

      spyOn(ChildProcess, 'spawn').and.resolveTo({stdout: '', stderr, status: 2});

      const status = await formatFiles([badFile]);
      expect(status).toBe(1);

      const errorMessages = errorSpy.calls.allArgs().map((args) => args[0]);
      expect(errorMessages).toContain('The following files could not be formatted:');
      expect(errorMessages).toContain(`  • ${badFile}:2: ${stderr}`);
    });
  });
});
