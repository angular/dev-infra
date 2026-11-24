/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConfigValidationError, NgDevConfig} from '../../../utils/config.js';
import {
  assertValidReleaseConfig,
  DevInfraReleaseConfig,
  EXIT_GATE_PROJECT_NAME_REGEX,
  ReleaseConfig,
} from '../index.js';

describe('assertValidReleaseConfig', () => {
  function createConfig(
    overrides: Partial<ReleaseConfig> = {},
  ): NgDevConfig & Partial<DevInfraReleaseConfig> {
    return {
      __isNgDevConfigObject: true,
      release: {
        representativeNpmPackage: '@angular/core',
        npmPackages: [{name: '@angular/core'}],
        buildPackages: async () => [],
        ...overrides,
      },
    };
  }

  function expectValidationErrors(
    config: NgDevConfig & Partial<DevInfraReleaseConfig>,
    expectedErrors: string[],
  ): void {
    try {
      assertValidReleaseConfig(config);
      fail('Expected assertValidReleaseConfig to throw ConfigValidationError.');
    } catch (err) {
      if (!(err instanceof ConfigValidationError)) {
        fail(`Expected ConfigValidationError, got: ${err}`);
        return;
      }
      expect(err.errors).toEqual(expectedErrors);
    }
  }

  it('should accept a valid base release configuration', () => {
    expect(() => assertValidReleaseConfig(createConfig())).not.toThrow();
  });

  it('should accept a valid publishRegistry-only configuration', () => {
    const config = createConfig({
      publishRegistry: 'https://registry.npmjs.org',
    });
    expect(() => assertValidReleaseConfig(config)).not.toThrow();
  });

  describe('exitGate configuration', () => {
    it('should accept a valid exitGate configuration', () => {
      const config = createConfig({
        exitGate: {projectName: 'angular'},
      });
      expect(() => assertValidReleaseConfig(config)).not.toThrow();
    });

    it('should accept valid boundary project names', () => {
      const validNames = ['a', '0', 'a1', 'angular-cli', 'a' + 'b'.repeat(61) + 'c'];
      for (const projectName of validNames) {
        expect(EXIT_GATE_PROJECT_NAME_REGEX.test(projectName))
          .withContext(`Expected "${projectName}" to match EXIT_GATE_PROJECT_NAME_REGEX`)
          .toBe(true);
        expect(() => assertValidReleaseConfig(createConfig({exitGate: {projectName}})))
          .withContext(`Expected "${projectName}" to pass validation`)
          .not.toThrow();
      }
    });

    it('should reject invalid projectName values', () => {
      const invalidNames: unknown[] = [
        '',
        'Angular',
        'ANGULAR',
        '../evil',
        'angular\n',
        'angular\nevil',
        'angular cli',
        ' angular',
        '-angular',
        'angular-',
        '-',
        'a'.repeat(64),
        123,
        null,
        undefined,
      ];

      for (const projectName of invalidNames) {
        const config = createConfig({
          exitGate: {projectName} as ReleaseConfig['exitGate'],
        });
        expectValidationErrors(config, [
          'Configured "exitGate.projectName" must be a valid OSS Exit Gate project name ' +
            '(lowercase alphanumeric and hyphens, 1-63 chars).',
        ]);
      }
    });

    it('should reject non-object exitGate values', () => {
      const invalidExitGates: unknown[] = [null, 'angular', 123, true, []];

      for (const exitGate of invalidExitGates) {
        const config = createConfig({
          exitGate: exitGate as ReleaseConfig['exitGate'],
        });
        expectValidationErrors(config, ['Configured "exitGate" must be an object.']);
      }
    });

    it('should reject when both exitGate and publishRegistry are configured', () => {
      const config = createConfig({
        exitGate: {projectName: 'angular'},
        publishRegistry: 'https://registry.npmjs.org',
      });
      expectValidationErrors(config, [
        'Cannot configure both "exitGate" and "publishRegistry" in release configuration.',
      ]);
    });

    it('should report both invalid exitGate and mutual exclusivity errors together', () => {
      const config = createConfig({
        exitGate: {projectName: 'INVALID'},
        publishRegistry: 'https://registry.npmjs.org',
      });
      expectValidationErrors(config, [
        'Configured "exitGate.projectName" must be a valid OSS Exit Gate project name ' +
          '(lowercase alphanumeric and hyphens, 1-63 chars).',
        'Cannot configure both "exitGate" and "publishRegistry" in release configuration.',
      ]);
    });
  });

  describe('representativeNpmPackage validation', () => {
    it('should interpolate the configured package name when missing from npmPackages', () => {
      const config = createConfig({
        representativeNpmPackage: '@angular/missing',
      });
      expectValidationErrors(config, [
        'Configured "representativeNpmPackage" (@angular/missing) does not match a package in ' +
          '"npmPackages".',
      ]);
    });

    it('should interpolate the configured package name when marked experimental', () => {
      const config = createConfig({
        representativeNpmPackage: '@angular/experimental',
        npmPackages: [{name: '@angular/experimental', experimental: true}],
      });
      expectValidationErrors(config, [
        'Configured "representativeNpmPackage" (@angular/experimental) corresponds to an ' +
          'experimental package. The representative NPM package is expected to be a ' +
          'long-standing and non-experimental package of the project.',
      ]);
    });
  });
});
