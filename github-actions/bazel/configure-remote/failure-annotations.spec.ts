/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {collectAnnotations, formatWorkflowCommands} from './failure-annotations.js';

function bep(...events: object[]): string {
  return events.map((event) => JSON.stringify(event)).join('\n');
}

function testSummary(label: string, overallStatus: string): object {
  return {id: {testSummary: {label}}, testSummary: {overallStatus}};
}

const FAILED_BUILD = {finished: {overallSuccess: false}};

describe('bazel failure annotations', () => {
  it('emits nothing when the last Bazel invocation succeeded', () => {
    const annotations = collectAnnotations(
      bep(testSummary('//pkg:test', 'FAILED'), {finished: {overallSuccess: true}}),
    );
    expect(annotations).toEqual([]);
  });

  it('reports the end of the test log of failed tests and ignores flaky tests', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'devinfra-ci-annotations-test-'));
    try {
      const logPath = path.join(tmp, 'test.log');
      fs.writeFileSync(
        logPath,
        ['Failures:', '1) bootstrap', '\x1b[31m  Expected 1 to be 2.\x1b[0m', ''].join('\n'),
      );
      const failLine = `\x1b[31mFAIL: \x1b[0m//pkg:failed (Exit 3) (see ${logPath})\n`;

      const annotations = collectAnnotations(
        bep(
          // A line of output can be split across two progress events.
          {progress: {stderr: `INFO: Build completed\n${failLine.slice(0, 20)}`}},
          {progress: {stderr: failLine.slice(20)}},
          testSummary('//pkg:flaky', 'FLAKY'),
          testSummary('//pkg:failed', 'FAILED'),
          testSummary('//pkg:timeout', 'TIMEOUT'),
          FAILED_BUILD,
        ),
      );

      expect(annotations).toEqual([
        {title: '//pkg:failed FAILED', message: 'Failures:\n1) bootstrap\n  Expected 1 to be 2.'},
        {title: '//pkg:timeout TIMEOUT', message: '//pkg:timeout TIMEOUT'},
      ]);
    } finally {
      fs.rmSync(tmp, {recursive: true, force: true});
    }
  });

  it('reports compiler diagnostics once for a test that failed to build', () => {
    const annotations = collectAnnotations(
      bep(
        {
          progress: {
            stderr: [
              '[123 / 500] Compiling TypeScript',
              '\x1b[31m\x1b[1mERROR:\x1b[0m /workspace/packages/core/BUILD.bazel:10:1: Compiling TypeScript failed',
              '',
            ].join('\n'),
            stdout:
              '\x1b[31mpackages/core/src/index.ts:12:5 - error TS2322: Type string is not assignable.\x1b[0m\n',
          },
        },
        {
          progress: {
            stderr: [
              'INFO: Elapsed time: 12s',
              'ERROR: Build did NOT complete successfully',
              '//packages/other:test (cached) PASSED in 1.1s',
            ].join('\n'),
          },
        },
        {
          id: {targetCompleted: {label: '//packages/core:test'}},
          completed: {failureDetail: {message: 'Compiling TypeScript failed'}},
        },
        testSummary('//packages/core:test', 'FAILED_TO_BUILD'),
        FAILED_BUILD,
      ),
    );

    expect(annotations).toEqual([
      {
        title: '//packages/core:test FAILED TO BUILD',
        message: [
          '//packages/core:test FAILED TO BUILD',
          'Compiling TypeScript failed',
          'ERROR: /workspace/packages/core/BUILD.bazel:10:1: Compiling TypeScript failed',
          'packages/core/src/index.ts:12:5 - error TS2322: Type string is not assignable.',
          'ERROR: Build did NOT complete successfully',
        ].join('\n'),
      },
    ]);
  });

  it('reports loading and analysis failures, which have no failed target', () => {
    const annotations = collectAnnotations(
      bep(
        {
          id: {pattern: {pattern: ['//packages/bad/...']}},
          aborted: {reason: 'ANALYSIS_FAILURE', description: "no such package 'packages/bad'"},
        },
        FAILED_BUILD,
      ),
    );

    expect(annotations).toEqual([
      {title: 'Bazel build failed', message: "no such package 'packages/bad'"},
    ]);
  });

  it('summarizes the failures beyond the 10 annotations that GitHub keeps per step', () => {
    const summaries = Array.from({length: 13}, (_, i) => testSummary(`//pkg:test_${i}`, 'FAILED'));
    const annotations = collectAnnotations(bep(...summaries, FAILED_BUILD));

    expect(annotations.length).toBe(10);
    expect(annotations[9]).toEqual({
      title: '4 more Bazel failure(s)',
      message:
        '//pkg:test_9 FAILED\n//pkg:test_10 FAILED\n//pkg:test_11 FAILED\n//pkg:test_12 FAILED',
    });
  });

  it('escapes workflow commands and keeps the end of messages that are too long', () => {
    const output = formatWorkflowCommands([
      {title: '//pkg:test FAILED', message: `${'x'.repeat(5000)}\n100% done\nlast line`},
    ]);
    expect(output).toBe('::error title=//pkg%3Atest FAILED::100%25 done%0Alast line');
  });
});

describe('problem matchers', () => {
  type Matchers = {problemMatcher: Array<{owner: string; pattern: Array<{regexp: string}>}>};
  const problemMatcher = [
    './bazel-matchers.json',
    '../../npm/checkout-and-setup-node/matchers.json',
  ]
    .map((file) => JSON.parse(fs.readFileSync(new URL(file, import.meta.url), 'utf8')) as Matchers)
    .flatMap((matchers) => matchers.problemMatcher);

  /** Matches a line against the pattern of every matcher, as the Actions runner does. */
  function match(line: string, patternIndex = 0): Record<string, string[]> {
    const matches: Record<string, string[]> = {};
    for (const {owner, pattern} of problemMatcher) {
      const groups = new RegExp(pattern[patternIndex]?.regexp ?? '$^').exec(line);
      if (groups !== null) {
        matches[owner] = groups.slice(1);
      }
    }
    return matches;
  }

  it('matches tsc errors', () => {
    expect(match("scripts/ci/foo.mts(12,5): error TS2322: Type 'a' is not 'b'.")).toEqual({
      'angular-tsc': ['scripts/ci/foo.mts', '12', '5', 'error', 'TS2322', "Type 'a' is not 'b'."],
    });
  });

  it('matches the file line and the failure lines of tslint output', () => {
    // Output of the default `stylish` formatter of tslint, as printed on CI.
    expect(match('/home/runner/work/angular/angular/packages/core/src/version.ts:32:1')).toEqual({
      'angular-tslint': ['/home/runner/work/angular/angular/packages/core/src/version.ts'],
    });
    expect(match("ERROR: 32:1  no-var-keyword  Forbidden 'var' keyword", 1)).toEqual({
      'angular-tslint': ['ERROR', '32', '1', 'no-var-keyword', "Forbidden 'var' keyword"],
    });
    expect(
      match(
        '\x1b[34mWARNING: 2:7\x1b[39m  \x1b[90msemicolon     \x1b[39m  \x1b[33mMissing semicolon\x1b[39m',
        1,
      ),
    ).toEqual({'angular-tslint': ['WARNING', '2', '7', 'semicolon', 'Missing semicolon']});
    // Failure lines must not be picked up by the single-line matchers.
    expect(match("ERROR: 32:1  no-var-keyword  Forbidden 'var' keyword")).toEqual({});
  });

  it('matches Bazel ERROR lines', () => {
    expect(
      match(
        '\x1b[31m\x1b[1mERROR:\x1b[0m /home/runner/work/angular/angular/packages/core/BUILD.bazel:10:1: Compiling TypeScript failed',
      ),
    ).toEqual({
      'angular-bazel-error-abs': [
        '/home/runner/work/angular/angular/packages/core/BUILD.bazel',
        '10',
        '1',
        'Compiling TypeScript failed',
      ],
    });
    expect(match('ERROR: packages/core/BUILD.bazel:10:1: Compiling TypeScript failed')).toEqual({
      'angular-bazel-error-rel': [
        'packages/core/BUILD.bazel',
        '10',
        '1',
        'Compiling TypeScript failed',
      ],
    });
  });

  it('matches circular dependencies and ng-dev errors', () => {
    expect(match('\x1b[31m     • packages/core/a.ts → packages/core/b.ts\x1b[39m')).toEqual({
      'angular-ts-circular-deps': ['packages/core/a.ts → packages/core/b.ts', 'packages/core/a.ts'],
    });
    expect(match('\x1b[31m✘  Golden does not match current circular deps.\x1b[39m')).toEqual({
      'angular-ng-dev-error': ['Golden does not match current circular deps.'],
    });
    expect(match('\x1b[31m! Invalid NgBot YAML config\x1b[39m')).toEqual({
      'angular-ng-dev-error': ['Invalid NgBot YAML config'],
    });
    expect(match('  • packages/core/a.ts')).toEqual({});
  });
});
