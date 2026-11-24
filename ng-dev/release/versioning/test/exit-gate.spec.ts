/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {resolve} from 'node:path';

import {ChildProcess} from '../../../utils/child-process.js';
import {Log} from '../../../utils/logging.js';
import {
  ALLOWED_NPM_DIST_TAG_REGEX,
  assertValidExitGateProject,
  assertValidNpmDistTag,
  buildExitGateNpmrcContent,
  createExitGateManifest,
  createManifestFileName,
  EXIT_GATE_AR_HOST,
  EXIT_GATE_AR_LOCATION,
  EXIT_GATE_GCP_PROJECT,
  EXIT_GATE_MANIFEST_BUCKET,
  EXIT_GATE_PROJECT_NAME_REGEX,
  ExitGateCommand,
  getExitGateArRegistryUrl,
  getExitGateArRepositoryName,
  getExitGateManifestGcsUri,
  PUBLIC_NPM_REGISTRY_URL,
} from '../exit-gate.js';

describe('OSS Exit Gate helpers', () => {
  describe('constants', () => {
    it('should export expected Exit Gate constants and regexes', () => {
      expect(EXIT_GATE_GCP_PROJECT).toBe('oss-exit-gate-prod');
      expect(EXIT_GATE_AR_LOCATION).toBe('us');
      expect(EXIT_GATE_AR_HOST).toBe('us-npm.pkg.dev');
      expect(EXIT_GATE_MANIFEST_BUCKET).toBe('oss-exit-gate-prod-projects-bucket');
      expect(PUBLIC_NPM_REGISTRY_URL).toBe('https://registry.npmjs.org/');
      expect(EXIT_GATE_PROJECT_NAME_REGEX).toBeInstanceOf(RegExp);
      expect(ALLOWED_NPM_DIST_TAG_REGEX).toBeInstanceOf(RegExp);
    });
  });

  describe('assertValidExitGateProject', () => {
    it('should accept and return valid project names', () => {
      for (const valid of [
        'a',
        'angular',
        'angular-cli',
        'components',
        'dev-infra',
        'angular2',
        'a'.repeat(63),
      ]) {
        expect(assertValidExitGateProject(valid)).toBe(valid);
      }
    });

    it('should reject invalid and malicious project names', () => {
      const invalidNames: unknown[] = [
        '',
        'a'.repeat(64),
        '../other',
        'angular/../other',
        'angular/sub',
        'Angular',
        'ANGULAR',
        'angular\nmalicious',
        'angular\r\nmalicious',
        'angular project',
        ' angular',
        'angular ',
        '@angular',
        '@angular/core',
        'angular*',
        'angular?',
        'angular[0]',
        '-angular',
        'angular-',
        '-',
        'angular_cli',
        'angular;rm',
        undefined,
        null,
        123,
      ];

      for (const invalid of invalidNames) {
        expect(() => assertValidExitGateProject(invalid as string)).toThrowError(
          /Invalid OSS Exit Gate project name/,
        );
      }
    });
  });

  describe('assertValidNpmDistTag', () => {
    it('should accept allowed Angular NPM dist-tags', () => {
      for (const valid of [
        'latest',
        'next',
        'do-not-use-exceptional-minor',
        'v18-lts',
        'v20-lts',
        'v100-lts',
      ]) {
        expect(() => assertValidNpmDistTag(valid)).not.toThrow();
      }
    });

    it('should reject disallowed or malicious NPM dist-tags', () => {
      const invalidTags: unknown[] = [
        '',
        'beta',
        'rc',
        'LATEST',
        'v-lts',
        'v18-lts-extra',
        'v18.0-lts',
        'latest\nnext',
        'latest ',
        '../latest',
        'latest*',
        '@latest',
        undefined,
        null,
        42,
      ];

      for (const invalid of invalidTags) {
        expect(() => assertValidNpmDistTag(invalid as string)).toThrowError(/Invalid NPM dist-tag/);
      }
    });
  });

  describe('getExitGateArRepositoryName', () => {
    it('should return `<project>--npm` for valid project names', () => {
      expect(getExitGateArRepositoryName('angular')).toBe('angular--npm');
      expect(getExitGateArRepositoryName('angular-cli')).toBe('angular-cli--npm');
    });

    it('should reject invalid project names', () => {
      expect(() => getExitGateArRepositoryName('../evil')).toThrowError(
        /Invalid OSS Exit Gate project name/,
      );
      expect(() => getExitGateArRepositoryName('-bad')).toThrowError(
        /Invalid OSS Exit Gate project name/,
      );
    });
  });

  describe('getExitGateArRegistryUrl', () => {
    it('should build the Artifact Registry npm URL with trailing slash', () => {
      expect(getExitGateArRegistryUrl('angular')).toBe(
        'https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/',
      );
      expect(getExitGateArRegistryUrl('dev-infra')).toBe(
        'https://us-npm.pkg.dev/oss-exit-gate-prod/dev-infra--npm/',
      );
    });

    it('should reject invalid project names', () => {
      expect(() => getExitGateArRegistryUrl('Angular')).toThrowError(
        /Invalid OSS Exit Gate project name/,
      );
    });
  });

  describe('getExitGateManifestGcsUri', () => {
    it('should build the GCS URI for a valid project and manifest file name', () => {
      expect(
        getExitGateManifestGcsUri('angular', 'manifest-20.1.0-abcdef12-1700000000000.json'),
      ).toBe(
        'gs://oss-exit-gate-prod-projects-bucket/angular/npm/manifests/manifest-20.1.0-abcdef12-1700000000000.json',
      );
    });

    it('should reject invalid project names', () => {
      expect(() => getExitGateManifestGcsUri('../other', 'manifest.json')).toThrowError(
        /Invalid OSS Exit Gate project name/,
      );
    });

    it('should reject invalid or path-traversal manifest file names', () => {
      const invalidFileNames: unknown[] = [
        '',
        '.json',
        'manifest.txt',
        'manifest.json.bak',
        '../manifest.json',
        'foo..bar.json',
        '..json',
        'subdir/manifest.json',
        'manifest*.json',
        'manifest?.json',
        'manifest with space.json',
        'manifest\n.json',
        '@manifest.json',
        undefined,
        null,
      ];

      for (const invalid of invalidFileNames) {
        expect(() => getExitGateManifestGcsUri('angular', invalid as string)).toThrowError(
          /Invalid Exit Gate manifest file name/,
        );
      }
    });
  });

  describe('buildExitGateNpmrcContent', () => {
    it('should generate .npmrc content with env-var indirection and provenance=false', () => {
      const content = buildExitGateNpmrcContent('angular');
      expect(content).toBe(
        [
          'registry=https://us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/',
          '//us-npm.pkg.dev/oss-exit-gate-prod/angular--npm/:_authToken=${EXIT_GATE_AR_TOKEN}',
          'provenance=false',
        ].join('\n') + '\n',
      );
    });

    it('should support a custom auth token environment variable name', () => {
      const content = buildExitGateNpmrcContent('angular-cli', 'CUSTOM_EXIT_GATE_TOKEN_2');
      expect(content).toBe(
        [
          'registry=https://us-npm.pkg.dev/oss-exit-gate-prod/angular-cli--npm/',
          '//us-npm.pkg.dev/oss-exit-gate-prod/angular-cli--npm/:_authToken=${CUSTOM_EXIT_GATE_TOKEN_2}',
          'provenance=false',
        ].join('\n') + '\n',
      );
    });

    it('should reject invalid project names', () => {
      expect(() => buildExitGateNpmrcContent('angular\nregistry=https://evil.test/')).toThrowError(
        /Invalid OSS Exit Gate project name/,
      );
    });

    it('should reject invalid auth token environment variable names', () => {
      const invalidEnvVars: unknown[] = [
        '',
        'lowercase_var',
        '123_STARTS_WITH_DIGIT',
        'TOKEN-WITH-HYPHEN',
        'TOKEN\nINJECTED=1',
        'TOKEN=raw-secret-value',
        'mock-raw-token',
        'TOKEN WITH SPACE',
        null,
      ];

      for (const invalid of invalidEnvVars) {
        expect(() => buildExitGateNpmrcContent('angular', invalid as string)).toThrowError(
          /Invalid auth token environment variable name/,
        );
      }
    });
  });

  describe('createExitGateManifest', () => {
    it('should create a publishing manifest for valid dist-tags', () => {
      expect(createExitGateManifest('latest')).toEqual({
        publish_all: true,
        registry_config: {
          npm: {
            tags: ['latest'],
          },
        },
      });
      expect(createExitGateManifest('v19-lts')).toEqual({
        publish_all: true,
        registry_config: {
          npm: {
            tags: ['v19-lts'],
          },
        },
      });
    });

    it('should reject invalid dist-tags', () => {
      expect(() => createExitGateManifest('arbitrary-tag')).toThrowError(/Invalid NPM dist-tag/);
    });
  });

  describe('createManifestFileName', () => {
    it('should format manifest file names using normalized SemVer, 8-char SHA prefix, and timestamp', () => {
      expect(createManifestFileName('20.1.0', 'abcdef1234567890', 1700000000000)).toBe(
        'manifest-20.1.0-abcdef12-1700000000000.json',
      );
      expect(createManifestFileName('v20.1.0-next.3', 'ABCDEF12', 1700000000001)).toBe(
        'manifest-20.1.0-next.3-ABCDEF12-1700000000001.json',
      );
      expect(createManifestFileName('20.1.0', '1234567', 1700000000002)).toBe(
        'manifest-20.1.0-1234567-1700000000002.json',
      );
    });

    it('should default timestamp to Date.now() and produce a valid GCS manifest name', () => {
      spyOn(Date, 'now').and.returnValue(1712345678901);
      const fileName = createManifestFileName('20.2.0', '0123456789abcdef');
      expect(fileName).toBe('manifest-20.2.0-01234567-1712345678901.json');
      expect(getExitGateManifestGcsUri('angular', fileName)).toBe(
        'gs://oss-exit-gate-prod-projects-bucket/angular/npm/manifests/manifest-20.2.0-01234567-1712345678901.json',
      );
    });

    it('should reject invalid SemVer versions', () => {
      for (const invalidVersion of ['', 'not-semver', '../1.0.0', '20.1', '20.1.0\nmalicious']) {
        expect(() =>
          createManifestFileName(invalidVersion, 'abcdef123456', 1700000000000),
        ).toThrowError(/Invalid SemVer version/);
      }
    });

    it('should reject invalid commit SHAs', () => {
      const invalidShas = [
        '',
        '123456',
        'g1234567',
        'a'.repeat(41),
        '../abcd123',
        'abcd1234\n',
        'abcd 1234',
      ];
      for (const invalidSha of invalidShas) {
        expect(() => createManifestFileName('20.1.0', invalidSha, 1700000000000)).toThrowError(
          /Invalid commit SHA/,
        );
      }
    });

    it('should reject invalid timestamps', () => {
      for (const invalidTimestamp of [Number.NaN, -1, 1.5, Number.POSITIVE_INFINITY]) {
        expect(() => createManifestFileName('20.1.0', 'abcdef12', invalidTimestamp)).toThrowError(
          /Invalid timestamp/,
        );
      }
    });
  });

  describe('ExitGateCommand', () => {
    describe('getAccessToken', () => {
      it('should fetch a CI token via _execGcloudForToken without invoking ChildProcess.spawn', async () => {
        const execSpy = spyOn(ExitGateCommand, '_execGcloudForToken').and.resolveTo(
          '  mock-ci-secret-token\n',
        );
        const spawnSpy = spyOn(ChildProcess, 'spawn');
        const maskSecret = jasmine.createSpy('maskSecret');

        const token = await ExitGateCommand.getAccessToken({maskSecret});

        expect(token).toBe('mock-ci-secret-token');
        expect(execSpy).toHaveBeenCalledWith(['auth', 'print-access-token', '--quiet']);
        expect(spawnSpy).not.toHaveBeenCalled();
        expect(maskSecret).toHaveBeenCalledTimes(1);
        expect(maskSecret).toHaveBeenCalledWith('mock-ci-secret-token');
      });

      it('should fetch an ADC token when useApplicationDefault is true', async () => {
        const execSpy = spyOn(ExitGateCommand, '_execGcloudForToken').and.resolveTo(
          'mock-adc-token\r\n',
        );
        const maskSecret = jasmine.createSpy('maskSecret');

        const token = await ExitGateCommand.getAccessToken({
          useApplicationDefault: true,
          maskSecret,
        });

        expect(token).toBe('mock-adc-token');
        expect(execSpy).toHaveBeenCalledWith([
          'auth',
          'application-default',
          'print-access-token',
          '--quiet',
        ]);
        expect(maskSecret).toHaveBeenCalledWith('mock-adc-token');
      });

      it('should reject empty or whitespace-only token output without calling maskSecret', async () => {
        spyOn(ExitGateCommand, '_execGcloudForToken').and.resolveTo('   \n\t  ');
        const maskSecret = jasmine.createSpy('maskSecret');

        await expectAsync(ExitGateCommand.getAccessToken({maskSecret})).toBeRejectedWithError(
          /empty or malformed access token/,
        );
        expect(maskSecret).not.toHaveBeenCalled();
      });

      it('should reject multiline or whitespace-containing token output without leaking output', async () => {
        const execSpy = spyOn(ExitGateCommand, '_execGcloudForToken');
        const maskSecret = jasmine.createSpy('maskSecret');

        for (const badOutput of [
          'mock-secret-line-1\nmock-secret-line-2\n',
          'mock-secret-line-1 mock-secret-line-2',
        ]) {
          execSpy.and.resolveTo(badOutput);

          try {
            await ExitGateCommand.getAccessToken({maskSecret});
            fail('Expected getAccessToken to reject');
          } catch (error) {
            expect(error instanceof Error).toBe(true);
            expect((error as Error).message).toMatch(/empty or malformed access token/);
            expect((error as Error).message).not.toContain('mock-secret-line-1');
            expect((error as Error).message).not.toContain('mock-secret-line-2');
          }
        }
        expect(maskSecret).not.toHaveBeenCalled();
      });

      it('should throw a clear Google Cloud SDK installation error on ENOENT', async () => {
        const enoentError = Object.assign(new Error('spawn gcloud ENOENT'), {code: 'ENOENT'});
        spyOn(ExitGateCommand, '_execGcloudForToken').and.rejectWith(enoentError);

        await expectAsync(ExitGateCommand.getAccessToken()).toBeRejectedWithError(
          'Failed to execute "gcloud". Please ensure the Google Cloud SDK is installed and available in your PATH.',
        );
      });

      it('should throw a sanitized error on non-ENOENT failures without leaking stderr/token', async () => {
        const rawError = Object.assign(new Error('Command failed: mock-leaked-secret'), {code: 1});
        spyOn(ExitGateCommand, '_execGcloudForToken').and.rejectWith(rawError);

        try {
          await ExitGateCommand.getAccessToken({useApplicationDefault: true});
          fail('Expected getAccessToken to reject');
        } catch (error) {
          expect(error instanceof Error).toBe(true);
          expect((error as Error).message).toBe(
            'Failed to obtain GCP access token via "gcloud auth application-default print-access-token" (code: 1).',
          );
          expect((error as Error).message).not.toContain('mock-leaked-secret');
        }
      });
    });

    describe('checkAdcAuthenticated', () => {
      it('should return true when ADC token retrieval succeeds', async () => {
        const getTokenSpy = spyOn(ExitGateCommand, 'getAccessToken').and.resolveTo('mock-valid');

        const result = await ExitGateCommand.checkAdcAuthenticated();

        expect(result).toBe(true);
        expect(getTokenSpy).toHaveBeenCalledWith({useApplicationDefault: true});
      });

      it('should return false when ADC token retrieval fails', async () => {
        spyOn(ExitGateCommand, 'getAccessToken').and.rejectWith(new Error('Not authenticated'));

        const result = await ExitGateCommand.checkAdcAuthenticated();

        expect(result).toBe(false);
      });
    });

    describe('startInteractiveAdcLogin', () => {
      it('should run gcloud auth application-default login interactively', async () => {
        const spawnInteractiveSpy = spyOn(ChildProcess, 'spawnInteractive').and.resolveTo();

        await ExitGateCommand.startInteractiveAdcLogin();

        expect(spawnInteractiveSpy).toHaveBeenCalledWith('gcloud', [
          'auth',
          'application-default',
          'login',
        ]);
      });

      it('should convert ENOENT into a clear Google Cloud SDK error', async () => {
        const enoentError = Object.assign(new Error('spawn gcloud ENOENT'), {code: 'ENOENT'});
        spyOn(ChildProcess, 'spawnInteractive').and.rejectWith(enoentError);

        await expectAsync(ExitGateCommand.startInteractiveAdcLogin()).toBeRejectedWithError(
          'Failed to execute "gcloud". Please ensure the Google Cloud SDK is installed and available in your PATH.',
        );
      });

      it('should propagate non-ENOENT failures', async () => {
        spyOn(ChildProcess, 'spawnInteractive').and.rejectWith(1);

        await expectAsync(ExitGateCommand.startInteractiveAdcLogin()).toBeRejectedWith(1);
      });
    });

    describe('cleanArtifactRegistryPackages', () => {
      beforeEach(() => {
        spyOn(Log, 'debug');
        spyOn(Log, 'info');
      });

      it('should return an empty array and perform no deletes when the repo is empty', async () => {
        const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
          stdout: '\n  \n',
          stderr: '',
          status: 0,
        });

        const deleted = await ExitGateCommand.cleanArtifactRegistryPackages('angular');

        expect(deleted).toEqual([]);
        expect(spawnSpy).toHaveBeenCalledTimes(1);
        expect(spawnSpy).toHaveBeenCalledWith(
          'gcloud',
          [
            'artifacts',
            'packages',
            'list',
            '--project',
            'oss-exit-gate-prod',
            '--location',
            'us',
            '--repository',
            'angular--npm',
            '--format',
            'value(name)',
            '--quiet',
          ],
          {mode: 'silent'},
        );
      });

      it('should delete multiple scoped and unscoped packages sequentially', async () => {
        const pkg1 =
          'projects/oss-exit-gate-prod/locations/us/repositories/angular--npm/packages/@angular%2Fcore';
        const pkg2 =
          'projects/oss-exit-gate-prod/locations/us/repositories/angular--npm/packages/@angular/common';
        const pkg3 =
          'projects/oss-exit-gate-prod/locations/us/repositories/angular--npm/packages/ng-dev';

        const spawnSpy = spyOn(ChildProcess, 'spawn').and.callFake(async (_cmd, args) => {
          if (args[2] === 'list') {
            return {stdout: `${pkg1}\r\n${pkg2}\n${pkg3}\n`, stderr: '', status: 0};
          }
          return {stdout: '', stderr: '', status: 0};
        });

        const deleted = await ExitGateCommand.cleanArtifactRegistryPackages('angular');

        expect(deleted).toEqual([pkg1, pkg2, pkg3]);
        expect(spawnSpy).toHaveBeenCalledTimes(4);
        expect(spawnSpy.calls.argsFor(1)).toEqual([
          'gcloud',
          ['artifacts', 'packages', 'delete', pkg1, '--quiet'],
          {mode: 'silent'},
        ]);
        expect(spawnSpy.calls.argsFor(2)).toEqual([
          'gcloud',
          ['artifacts', 'packages', 'delete', pkg2, '--quiet'],
          {mode: 'silent'},
        ]);
        expect(spawnSpy.calls.argsFor(3)).toEqual([
          'gcloud',
          ['artifacts', 'packages', 'delete', pkg3, '--quiet'],
          {mode: 'silent'},
        ]);
      });

      it('should pass CLOUDSDK_AUTH_ACCESS_TOKEN via env for list and delete when accessToken is provided', async () => {
        const pkg1 =
          'projects/oss-exit-gate-prod/locations/us/repositories/angular--npm/packages/@angular%2Fcore';

        const spawnSpy = spyOn(ChildProcess, 'spawn').and.callFake(async (_cmd, args) => {
          if (args[2] === 'list') {
            return {stdout: `${pkg1}\n`, stderr: '', status: 0};
          }
          return {stdout: '', stderr: '', status: 0};
        });

        const deleted = await ExitGateCommand.cleanArtifactRegistryPackages('angular', {
          accessToken: 'mock-local-adc-token',
        });

        const expectedSpawnOptions = {
          mode: 'silent' as const,
          sensitiveOutput: true,
          env: {...process.env, CLOUDSDK_AUTH_ACCESS_TOKEN: 'mock-local-adc-token'},
        };

        expect(deleted).toEqual([pkg1]);
        expect(spawnSpy).toHaveBeenCalledTimes(2);
        expect(spawnSpy.calls.argsFor(0)).toEqual([
          'gcloud',
          [
            'artifacts',
            'packages',
            'list',
            '--project',
            'oss-exit-gate-prod',
            '--location',
            'us',
            '--repository',
            'angular--npm',
            '--format',
            'value(name)',
            '--quiet',
          ],
          expectedSpawnOptions,
        ]);
        expect(spawnSpy.calls.argsFor(1)).toEqual([
          'gcloud',
          ['artifacts', 'packages', 'delete', pkg1, '--quiet'],
          expectedSpawnOptions,
        ]);
      });

      it('should omit env when options.accessToken is undefined', async () => {
        const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
          stdout: '',
          stderr: '',
          status: 0,
        });

        await ExitGateCommand.cleanArtifactRegistryPackages('angular', {});

        expect(spawnSpy).toHaveBeenCalledTimes(1);
        expect(spawnSpy.calls.argsFor(0)[2]).toEqual({mode: 'silent'});
      });

      it('should reject invalid project names before invoking gcloud', async () => {
        const spawnSpy = spyOn(ChildProcess, 'spawn');

        await expectAsync(
          ExitGateCommand.cleanArtifactRegistryPackages('../other'),
        ).toBeRejectedWithError(/Invalid OSS Exit Gate project name/);
        expect(spawnSpy).not.toHaveBeenCalled();
      });

      it('should reject unexpected resource paths and delete nothing', async () => {
        const validPkg =
          'projects/oss-exit-gate-prod/locations/us/repositories/angular--npm/packages/@angular%2Fcore';
        const badPaths = [
          'projects/oss-exit-gate-prod/locations/us/repositories/other--npm/packages/@angular%2Fcore',
          'projects/other-project/locations/us/repositories/angular--npm/packages/@angular%2Fcore',
          'projects/oss-exit-gate-prod/locations/us/repositories/angular--npm/packages/',
          'projects/oss-exit-gate-prod/locations/us/repositories/angular--npm/packages/@angular core',
          'projects/oss-exit-gate-prod/locations/us/repositories/angular--npm/packages/../other',
        ];
        const spawnSpy = spyOn(ChildProcess, 'spawn');

        for (const badPath of badPaths) {
          spawnSpy.calls.reset();
          spawnSpy.and.resolveTo({
            stdout: `${validPkg}\n${badPath}\n`,
            stderr: '',
            status: 0,
          });

          await expectAsync(
            ExitGateCommand.cleanArtifactRegistryPackages('angular'),
          ).toBeRejectedWithError(/Unexpected Artifact Registry package resource name/);
          // Only the `list` invocation should have run; no `delete` calls should occur.
          expect(spawnSpy).toHaveBeenCalledTimes(1);
        }
      });
    });

    describe('uploadManifest', () => {
      beforeEach(() => {
        spyOn(Log, 'debug');
      });

      it('should resolve local path, upload JSON manifest to GCS, and return GCS URI', async () => {
        const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
          stdout: '',
          stderr: '',
          status: 0,
        });

        const localPath = 'tmp/manifest-20.1.0-abcdef12-1700000000000.json';
        const expectedResolved = resolve(localPath);
        const expectedUri =
          'gs://oss-exit-gate-prod-projects-bucket/angular/npm/manifests/manifest-20.1.0-abcdef12-1700000000000.json';

        const result = await ExitGateCommand.uploadManifest(
          localPath,
          'angular',
          'manifest-20.1.0-abcdef12-1700000000000.json',
        );

        expect(result).toBe(expectedUri);
        expect(spawnSpy).toHaveBeenCalledWith(
          'gcloud',
          [
            'storage',
            'cp',
            '--content-type=application/json',
            '--quiet',
            expectedResolved,
            expectedUri,
          ],
          {mode: 'silent'},
        );
      });

      it('should pass CLOUDSDK_AUTH_ACCESS_TOKEN via env when accessToken is provided', async () => {
        const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
          stdout: '',
          stderr: '',
          status: 0,
        });

        const localPath = 'tmp/manifest-20.1.0-abcdef12-1700000000000.json';
        const expectedResolved = resolve(localPath);
        const expectedUri =
          'gs://oss-exit-gate-prod-projects-bucket/angular/npm/manifests/manifest-20.1.0-abcdef12-1700000000000.json';

        const result = await ExitGateCommand.uploadManifest(
          localPath,
          'angular',
          'manifest-20.1.0-abcdef12-1700000000000.json',
          {accessToken: 'mock-local-adc-token'},
        );

        expect(result).toBe(expectedUri);
        expect(spawnSpy).toHaveBeenCalledWith(
          'gcloud',
          [
            'storage',
            'cp',
            '--content-type=application/json',
            '--quiet',
            expectedResolved,
            expectedUri,
          ],
          {
            mode: 'silent',
            sensitiveOutput: true,
            env: {...process.env, CLOUDSDK_AUTH_ACCESS_TOKEN: 'mock-local-adc-token'},
          },
        );
      });

      it('should omit env when options.accessToken is undefined', async () => {
        const spawnSpy = spyOn(ChildProcess, 'spawn').and.resolveTo({
          stdout: '',
          stderr: '',
          status: 0,
        });

        await ExitGateCommand.uploadManifest('/tmp/manifest.json', 'angular', 'manifest.json', {});

        expect(spawnSpy).toHaveBeenCalledTimes(1);
        expect(spawnSpy.calls.argsFor(0)[2]).toEqual({mode: 'silent'});
      });

      it('should reject local paths containing glob characters before invoking gcloud', async () => {
        const spawnSpy = spyOn(ChildProcess, 'spawn');

        for (const globPath of [
          '/tmp/manifest*.json',
          '/tmp/manifest?.json',
          '/tmp/manifest[0].json',
          '/tmp/manifest].json',
        ]) {
          await expectAsync(
            ExitGateCommand.uploadManifest(globPath, 'angular', 'manifest.json'),
          ).toBeRejectedWithError(/must not contain glob characters/);
        }
        expect(spawnSpy).not.toHaveBeenCalled();
      });

      it('should reject empty local paths and invalid project or manifest names', async () => {
        const spawnSpy = spyOn(ChildProcess, 'spawn');

        await expectAsync(
          ExitGateCommand.uploadManifest('   ', 'angular', 'manifest.json'),
        ).toBeRejectedWithError(/Local manifest path must be a non-empty string/);
        await expectAsync(
          ExitGateCommand.uploadManifest('/tmp/manifest.json', 'BadProject', 'manifest.json'),
        ).toBeRejectedWithError(/Invalid OSS Exit Gate project name/);
        await expectAsync(
          ExitGateCommand.uploadManifest('/tmp/manifest.json', 'angular', '../manifest.json'),
        ).toBeRejectedWithError(/Invalid Exit Gate manifest file name/);
        expect(spawnSpy).not.toHaveBeenCalled();
      });
    });
  });
});
