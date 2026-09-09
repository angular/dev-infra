/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {cleanTestTmpDir, testTmpDir} from '../testing/index.js';
import {Prompt} from '../prompt.js';
import {GitClient} from '../git/git-client.js';
import {extractNgDevVersionFromPnpmLock, verifyNgDevToolIsUpToDate} from '../version-check.js';

describe('extractNgDevVersionFromPnpmLock', () => {
  it('should extract ng-dev version from a single-document pnpm-lock.yaml', () => {
    const lockfile = `
lockfileVersion: '9.0'

importers:
  .:
    devDependencies:
      '@angular/ng-dev':
        specifier: ^18.0.0
        version: 18.0.0

packages:
  '@angular/ng-dev@18.0.0':
    resolution: {integrity: sha512-test==}
    version: 18.0.0
`;

    expect(extractNgDevVersionFromPnpmLock(lockfile)).toBe('18.0.0');
  });

  it('should extract ng-dev version from a multi-document pnpm-lock.yaml', () => {
    const lockfile = `
---
lockfileVersion: '9.0'

importers:
  .:
    configDependencies: {}
    packageManagerDependencies:
      pnpm:
        specifier: 12.3.4
        version: 12.3.4

packages:
  '@pnpm/exe.darwin-arm64@12.3.4':
    resolution: {integrity: sha512-test==}

---
lockfileVersion: '9.0'

settings:
  autoInstallPeers: false

importers:
  .:
    devDependencies:
      '@angular/ng-dev':
        specifier: https://github.com/angular/dev-infra-private-ng-dev-builds.git#2fe8cf97ca7d7f1616c3f29e910dde3a7ac5b981
        version: https://codeload.github.com/angular/dev-infra-private-ng-dev-builds/tar.gz/2fe8cf97ca7d7f1616c3f29e910dde3a7ac5b981(@modelcontextprotocol/sdk@1.30.0(supports-color@11.0.0))

packages:
  '@angular/ng-dev@https://codeload.github.com/angular/dev-infra-private-ng-dev-builds/tar.gz/2fe8cf97ca7d7f1616c3f29e910dde3a7ac5b981':
    resolution: {gitHosted: true}
    version: 0.0.0-183403ae13b785698eaf13c819dda55b9fed430b
`;

    expect(extractNgDevVersionFromPnpmLock(lockfile)).toBe(
      '0.0.0-183403ae13b785698eaf13c819dda55b9fed430b',
    );
  });

  it('should extract ng-dev version when listed in dependencies', () => {
    const lockfile = `
---
lockfileVersion: '9.0'

importers:
  .:
    packageManagerDependencies:
      pnpm:
        specifier: 12.3.4
        version: 12.3.4

---
lockfileVersion: '9.0'

importers:
  .:
    dependencies:
      '@angular/ng-dev':
        specifier: 19.0.0
        version: 19.0.0

packages:
  '@angular/ng-dev@19.0.0':
    version: 19.0.0
`;

    expect(extractNgDevVersionFromPnpmLock(lockfile)).toBe('19.0.0');
  });

  it('should extract ng-dev version when depEntry is a string (older lockfile format)', () => {
    const lockfile = `
lockfileVersion: '5.4'

importers:
  .:
    dependencies:
      '@angular/ng-dev': 17.0.0

packages:
  '@angular/ng-dev@17.0.0':
    version: 17.0.0
`;

    expect(extractNgDevVersionFromPnpmLock(lockfile)).toBe('17.0.0');
  });

  it('should handle depEntry object with missing version gracefully without throwing', () => {
    const lockfile = `
lockfileVersion: '9.0'

importers:
  .:
    dependencies:
      '@angular/ng-dev':
        specifier: ^18.0.0
`;

    expect(extractNgDevVersionFromPnpmLock(lockfile)).toBeNull();
  });

  it('should return null if ng-dev is not present in lockfile', () => {
    const lockfile = `
lockfileVersion: '9.0'

importers:
  .:
    dependencies:
      tslib:
        specifier: ^2.0.0
        version: 2.5.0
`;

    expect(extractNgDevVersionFromPnpmLock(lockfile)).toBeNull();
  });

  it('should throw an error for invalid YAML syntax', () => {
    const lockfile = `
invalid: yaml: :
`;

    expect(() => extractNgDevVersionFromPnpmLock(lockfile)).toThrow();
  });
});

describe('verifyNgDevToolIsUpToDate', () => {
  let gitClientMock: any;

  beforeEach(() => {
    cleanTestTmpDir();
    fs.writeFileSync(
      path.join(testTmpDir, 'package.json'),
      JSON.stringify({name: 'test-project', version: '1.0.0'}),
    );

    gitClientMock = {
      remoteConfig: {name: 'repo', owner: 'owner', mainBranchName: 'main'},
      github: {
        repos: {
          getContent: jasmine.createSpy('getContent'),
        },
      },
    };
    spyOn(GitClient, 'get').and.returnValue(Promise.resolve(gitClientMock as any));
  });

  it('should prompt user to continue when extracting version fails and return true if confirmed', async () => {
    gitClientMock.github.repos.getContent.and.rejectWith(new Error('Network error'));
    spyOn(Prompt, 'confirm').and.returnValue(Promise.resolve(true));

    const result = await verifyNgDevToolIsUpToDate(testTmpDir);

    expect(Prompt.confirm).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: 'Do you want to continue anyway?',
        default: false,
      }),
    );
    expect(result).toBeTrue();
  });

  it('should return false when extracting version fails and user declines prompt', async () => {
    gitClientMock.github.repos.getContent.and.rejectWith(new Error('Network error'));
    spyOn(Prompt, 'confirm').and.returnValue(Promise.resolve(false));

    const result = await verifyNgDevToolIsUpToDate(testTmpDir);

    expect(Prompt.confirm).toHaveBeenCalled();
    expect(result).toBeFalse();
  });
});
