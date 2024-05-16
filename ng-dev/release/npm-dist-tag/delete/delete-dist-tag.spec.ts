/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NpmCommand} from '../../versioning/npm-command.js';
import {NpmPackage} from '../../config/index.js';

import {ReleaseNpmDistTagDeleteCommand} from './cli.js';
import {ReleaseConfig} from '../../config/index.js';
import {setConfig} from '../../../utils/config.js';

describe('ng-dev release npm-dist-tag delete', () => {
  let npmPackages: NpmPackage[];
  let publishRegistry: string | undefined;

  beforeEach(() => {
    npmPackages = [{name: '@angular/pkg1'}, {name: '@angular/pkg2'}];
    publishRegistry = undefined;

    spyOn(NpmCommand, 'deleteDistTagForPackage');
    // We need to stub out the `process.exit` function during tests as the
    // CLI handler calls those in case of failures.
    spyOn(process, 'exit');
  });

  /** Invokes the command handler. */
  async function invokeCommand(tagName: string) {
    setConfig({
      release: {
        representativeNpmPackage: npmPackages[0].name,
        npmPackages,
        publishRegistry,
        buildPackages: async () => [],
      } as ReleaseConfig,
    });
    await ReleaseNpmDistTagDeleteCommand.handler({
      tagName,
      $0: '',
      _: [],
    });
  }

  it('should invoke "npm dist-tag" command for all configured packages', async () => {
    await invokeCommand('some-tag');
    expect(NpmCommand.deleteDistTagForPackage).toHaveBeenCalledTimes(2);
    expect(NpmCommand.deleteDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg1',
      'some-tag',
      undefined,
    );
    expect(NpmCommand.deleteDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg2',
      'some-tag',
      undefined,
    );
  });

  it('should always invoke "npm dist-tag" for experimental packages', async () => {
    npmPackages.push({name: '@whatever/experimental', experimental: true});
    await invokeCommand('some-tag');

    expect(NpmCommand.deleteDistTagForPackage).toHaveBeenCalledTimes(3);
    expect(NpmCommand.deleteDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg1',
      'some-tag',
      undefined,
    );
    expect(NpmCommand.deleteDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg2',
      'some-tag',
      undefined,
    );
    expect(NpmCommand.deleteDistTagForPackage).toHaveBeenCalledWith(
      '@whatever/experimental',
      'some-tag',
      undefined,
    );
  });

  it('should support a configured custom NPM registry', async () => {
    publishRegistry = 'https://my-custom-registry.angular.io';
    await invokeCommand('some-tag');

    expect(NpmCommand.deleteDistTagForPackage).toHaveBeenCalledTimes(2);
    expect(NpmCommand.deleteDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg1',
      'some-tag',
      'https://my-custom-registry.angular.io',
    );
    expect(NpmCommand.deleteDistTagForPackage).toHaveBeenCalledWith(
      '@angular/pkg2',
      'some-tag',
      'https://my-custom-registry.angular.io',
    );
  });
});
