/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {matchesVersion} from '../../utils/testing';
import {NpmCommand} from '../versioning/npm-command';
import {NpmPackage} from '../config/index';

import {ReleaseSetDistTagCommand} from './cli';
import {ReleaseConfig} from '../config';
import {setConfig} from '../../utils/config';

describe('ng-dev release set-dist-tag', () => {
  let npmPackages: NpmPackage[];
  let publishRegistry: string | undefined;

  beforeEach(() => {
    npmPackages = [{name: '@angular/pkg1'}, {name: '@angular/pkg2'}];
    publishRegistry = undefined;

    spyOn(NpmCommand, 'setDistTagForPackage');
    // We need to stub out the `process.exit` function during tests as the
    // CLI handler calls those in case of failures.
    spyOn(process, 'exit');
  });

  /** Invokes the `set-dist-tag` command handler. */
  async function invokeCommand(
    tagName: string,
    targetVersion: string,
    {skipExperimentalPackages}: {skipExperimentalPackages: boolean} = {
      skipExperimentalPackages: false,
    },
  ) {
    setConfig({
      release: {
        representativeNpmPackage: npmPackages[0].name,
        npmPackages,
        publishRegistry,
        buildPackages: async () => [],
      } as ReleaseConfig,
    });
    await ReleaseSetDistTagCommand.handler({
      tagName,
      targetVersion,
      skipExperimentalPackages,
      $0: '',
      _: [],
    });
  }

  it('should invoke "npm dist-tag" command for all configured packages', async () => {
    await invokeCommand('latest', '10.0.0');
    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledTimes(2);
    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg1',
      'latest',
      matchesVersion('10.0.0'),
      undefined,
    );
    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg2',
      'latest',
      matchesVersion('10.0.0'),
      undefined,
    );
  });

  it('should properly invoke "npm dist-tag" for experimental packages', async () => {
    npmPackages.push({name: '@whatever/experimental', experimental: true});
    await invokeCommand('latest', '10.0.0');

    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledTimes(3);
    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg1',
      'latest',
      matchesVersion('10.0.0'),
      undefined,
    );
    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg2',
      'latest',
      matchesVersion('10.0.0'),
      undefined,
    );
    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledWith(
      '@whatever/experimental',
      'latest',
      // Expected to match an experimental SemVer version as used commonly throughout the
      // Angular organization. The major is collapsed to the minor digit with a base of 100.
      matchesVersion('0.1000.0'),
      undefined,
    );
  });

  it('should be possible to skip the dist tag update for experimental packages', async () => {
    npmPackages.push({name: '@whatever/experimental', experimental: true});
    await invokeCommand('latest', '10.0.0', {skipExperimentalPackages: true});

    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledTimes(2);
    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg1',
      'latest',
      matchesVersion('10.0.0'),
      undefined,
    );
    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg2',
      'latest',
      matchesVersion('10.0.0'),
      undefined,
    );
  });

  it('should support a configured custom NPM registry', async () => {
    publishRegistry = 'https://my-custom-registry.angular.io';
    await invokeCommand('latest', '10.0.0');

    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledTimes(2);
    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg1',
      'latest',
      matchesVersion('10.0.0'),
      'https://my-custom-registry.angular.io',
    );
    expect(NpmCommand.setDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg2',
      'latest',
      matchesVersion('10.0.0'),
      'https://my-custom-registry.angular.io',
    );
  });

  it('should error if an invalid version has been specified', async () => {
    spyOn(console, 'error');
    await invokeCommand('latest', '10.0');

    expect(console.error).toHaveBeenCalledWith(
      'Invalid version specified (10.0). Unable to set NPM dist tag.',
    );
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(process.exit).toHaveBeenCalledTimes(1);
  });

  it('should error if an experimental SemVer version has been specified', async () => {
    spyOn(console, 'error');
    await invokeCommand('latest', '0.110.0');

    expect(console.error).toHaveBeenCalledWith(
      'Unexpected experimental SemVer version specified. This command ' +
        'expects a non-experimental project SemVer version.',
    );
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(process.exit).toHaveBeenCalledTimes(1);
  });
});
