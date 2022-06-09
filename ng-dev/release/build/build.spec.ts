/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BuildWorker} from './index';
import {setConfig} from '../../utils/config';
import {BuiltPackage, NpmPackage, ReleaseConfig} from '../config';
import {ReleaseBuildCommandModule} from './cli';

describe('ng-dev release build', () => {
  let npmPackages: NpmPackage[];
  let buildPackages: jasmine.Spy;

  beforeEach(() => {
    npmPackages = [{name: '@angular/pkg1'}, {name: '@angular/pkg2'}];
    buildPackages = jasmine.createSpy('buildPackages').and.resolveTo([
      {name: '@angular/pkg1', outputPath: 'dist/pkg1'},
      {name: '@angular/pkg2', outputPath: 'dist/pkg2'},
    ]);

    // We cannot test the worker process, so we fake the worker build function and
    // directly call the package build function.
    spyOn(BuildWorker, 'invokeBuild').and.callFake(() => buildPackages());
    // We need to stub out the `process.exit` function during tests as the CLI
    // handler calls those in case of failures.
    spyOn(process, 'exit');
  });

  /** Invokes the build command handler. */
  async function invokeBuild({json}: {json?: boolean} = {}) {
    setConfig({
      release: {
        representativeNpmPackage: npmPackages[0].name,
        npmPackages,
        buildPackages,
      } as ReleaseConfig,
    });

    await ReleaseBuildCommandModule.handler({json: !!json, stampForRelease: true, $0: '', _: []});
  }

  it('should invoke configured build packages function', async () => {
    await invokeBuild();
    expect(buildPackages).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledTimes(0);
  });

  it('should print built packages as JSON if `--json` is specified', async () => {
    const writeSpy = spyOn(process.stdout, 'write');
    await invokeBuild({json: true});

    expect(buildPackages).toHaveBeenCalledTimes(1);
    expect(writeSpy).toHaveBeenCalledTimes(1);

    const jsonText = writeSpy.calls.mostRecent().args[0] as string;
    const parsed = JSON.parse(jsonText) as BuiltPackage[];

    expect(parsed).toEqual([
      {name: '@angular/pkg1', outputPath: 'dist/pkg1'},
      {name: '@angular/pkg2', outputPath: 'dist/pkg2'},
    ]);
    expect(process.exit).toHaveBeenCalledTimes(0);
  });

  it('should error if package has not been built', async () => {
    // Set up an NPM package that is not built.
    npmPackages.push({name: '@angular/non-existent', experimental: true});

    spyOn(console, 'error');
    await invokeBuild();

    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(
      jasmine.stringMatching(`Release output missing for the following packages`),
    );
    expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching(`- @angular/non-existent`));
    expect(process.exit).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
