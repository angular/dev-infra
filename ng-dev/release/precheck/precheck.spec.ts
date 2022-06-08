/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';
import {Readable} from 'stream';

import {BuiltPackageWithInfo, ReleaseConfig} from '../config/index.js';
import {ReleasePrecheckCommandModule, ReleasePrecheckJsonStdin} from './cli.js';
import {ReleasePrecheckError} from './index.js';
import {setConfig} from '../../utils/config.js';

describe('ng-dev release precheck', () => {
  // Keep track of the original `stdin` since we might fake it within specs.
  const _originalStdin = process.stdin;
  const _originalProcessExitCode = process.exitCode;

  const npmPackages = [{name: '@angular/pkg1'}, {name: '@angular/pkg2'}];
  const builtPackagesWithInfo: BuiltPackageWithInfo[] = [
    {name: '@angular/pkg1', outputPath: 'dist/pkg1', hash: '<>', experimental: false},
    {name: '@angular/pkg2', outputPath: 'dist/pkg2', hash: '<>', experimental: false},
  ];

  let prereleaseCheckSpy: jasmine.Spy<NonNullable<ReleaseConfig['prereleaseCheck']>> | undefined =
    undefined;

  beforeEach(() => {
    prereleaseCheckSpy = jasmine
      .createSpy('ReleaseConfig#prereleaseCheck')
      .and.callFake(() => Promise.resolve());

    setConfig({
      release: {
        representativeNpmPackage: npmPackages[0].name,
        npmPackages,
        prereleaseCheck: prereleaseCheckSpy,
        buildPackages: () => Promise.resolve(builtPackagesWithInfo),
      } as ReleaseConfig,
    });
  });

  afterEach(() => {
    updateStdinGetter(_originalStdin);
    process.exitCode = _originalProcessExitCode;
  });

  /**
   * Updates the `process.stdin` property. Direct assignments will not work
   * since NodeJS declares `stdin` using a property accessor.
   */
  function updateStdinGetter(newStdin: NodeJS.ReadableStream) {
    Object.defineProperty(process, 'stdin', {get: () => newStdin});
  }

  /** Invokes the build command handler. */
  async function invokePrecheck(stdin: ReleasePrecheckJsonStdin) {
    const fakeStdin = Readable.from(Buffer.from(JSON.stringify(stdin)));

    updateStdinGetter(fakeStdin);

    await ReleasePrecheckCommandModule.handler({$0: '', _: []});
  }

  it('should invoke configured pre-check function', async () => {
    await invokePrecheck({
      builtPackagesWithInfo,
      newVersion: '0.0.0',
    });

    expect(prereleaseCheckSpy).toHaveBeenCalledTimes(1);
    expect(prereleaseCheckSpy).toHaveBeenCalledWith('0.0.0', builtPackagesWithInfo);
    expect(process.exitCode).toBe(undefined);
  });

  it('should pass pre-check if no custom check function is defined', async () => {
    prereleaseCheckSpy = undefined;

    await invokePrecheck({
      builtPackagesWithInfo,
      newVersion: '0.0.0',
    });

    expect(process.exitCode).toBe(undefined);
  });

  it('should allow for failures to be reported in prechecks', async () => {
    const precheckUserError =
      'The peer dependency in `a/b/c` is invalid. Please update it ' +
      'to `X` before re-attempting to release.';

    prereleaseCheckSpy!.and.callFake(async () => {
      // print the error explaining the issue and how it can be fixed.
      // this is how a real custom pre-check should be built.
      console.error(precheckUserError);

      // throw the error to indicate the pre-check failure.
      throw new ReleasePrecheckError();
    });

    spyOn(console, 'error');

    await invokePrecheck({
      builtPackagesWithInfo,
      newVersion: '0.0.0',
    });

    expect(prereleaseCheckSpy).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBe(1);
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(precheckUserError);
    expect(console.error).toHaveBeenCalledWith(
      jasmine.stringContaining('Release pre-checks failed.'),
    );
  });

  it('should recognize runtime errors in custom pre-check function', async () => {
    prereleaseCheckSpy!.and.callFake(() =>
      Promise.reject(new Error('SyntaxError/Some runtime error')),
    );

    await invokePrecheck({
      builtPackagesWithInfo,
      newVersion: '0.0.0',
    });

    expect(prereleaseCheckSpy).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBe(1);
  });

  it('should error if transported stdin metadata is invalid', async () => {
    await invokePrecheck({
      builtPackagesWithInfo,
      // pass a version object instead of the string.
      newVersion: semver.parse('0.0.0') as any,
    });

    expect(prereleaseCheckSpy).toHaveBeenCalledTimes(0);
    expect(process.exitCode).toBe(1);

    process.exitCode = 0;

    await invokePrecheck({
      builtPackagesWithInfo: 'not the expected array' as any,
      newVersion: '0.0.0',
    });

    expect(prereleaseCheckSpy).toHaveBeenCalledTimes(0);
    expect(process.exitCode).toBe(1);
  });
});
