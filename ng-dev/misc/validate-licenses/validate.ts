/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import licenseChecker, {ModuleInfo, ModuleInfos} from 'license-checker';
import spdx from 'spdx-satisfies';

// A general note on some disallowed licenses:
// - CC0
//    This is not a valid license. It does not grant copyright of the code/asset, and does not
//    resolve patents or other licensed work. The different claims also have no standing in court
//    and do not provide protection to or from Google and/or third parties.
//    We cannot use nor contribute to CC0 licenses.
// - Public Domain
//    Same as CC0, it is not a valid license.

/** List of established allowed licenses for depdenencies. */
const allowedLicenses = [
  // Notice licenses
  'MIT',
  'ISC',
  'Apache-2.0',
  'Python-2.0',
  'Artistic-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BSD-4-Clause',
  'Zlib',
  'AFL-2.1',
  'CC-BY-3.0',
  'CC-BY-4.0',

  // Unencumbered
  'Unlicense',
  'CC0-1.0',
  '0BSD',
];

/** Known name variations of SPDX licenses. */
const licenseReplacements = new Map<string, string>([
  // Just a longer string that our script catches. SPDX official name is the shorter one.
  ['Apache License, Version 2.0', 'Apache-2.0'],
  ['Apache2', 'Apache-2.0'],
  ['Apache 2.0', 'Apache-2.0'],
  ['Apache v2', 'Apache-2.0'],

  // Alternate syntax
  ['AFLv2.1', 'AFL-2.1'],

  // BSD is BSD-2-clause by default.
  ['BSD', 'BSD-2-Clause'],
]);

interface ExpandedModuleInfo extends ModuleInfo {
  name: string;
  allowed: boolean;
}

export interface LicenseCheckResult {
  valid: boolean;
  packages: ExpandedModuleInfo[];
  maxPkgNameLength: number;
}

export async function checkAllLicenses(start: string): Promise<LicenseCheckResult> {
  return new Promise((resolve, reject) => {
    let maxPkgNameLength = 0;
    licenseChecker.init({start}, (err: Error, pkgInfoObject: ModuleInfos) => {
      // If the license processor fails, reject the process with the error.
      if (err) {
        console.log('thats an error');
        return reject(err);
      }

      // Check each package to ensure its license(s) are allowed.
      const packages = Object.entries(pkgInfoObject).map<ExpandedModuleInfo>(
        ([name, pkg]: [string, ModuleInfo]) => {
          maxPkgNameLength = Math.max(maxPkgNameLength, name.length);
          /**
           * Array of licenses for the package.
           *
           * Note: Typically a package will only have one license, but support for multiple license
           *       is necessary for full support.
           */
          const licenses = Array.isArray(pkg.licenses) ? pkg.licenses : [pkg.licenses!];

          return {
            ...pkg,
            name,
            allowed: licenses.some(assertAllowedLicense),
          };
        },
      );

      resolve({
        valid: packages.every((pkg) => pkg.allowed),
        packages,
        maxPkgNameLength,
      });
    });
  });
}

const allowedLicensesSpdxExpression = allowedLicenses.join(' OR ');
// Check if a license is accepted by an array of accepted licenses
function assertAllowedLicense(license: string) {
  // Licenses which are determined based on a file other than LICENSE are have an * appended.
  // See https://www.npmjs.com/package/license-checker#how-licenses-are-found
  const strippedLicense = license.endsWith('*') ? license.slice(0, -1) : license;
  try {
    // If the license is included in the known replacements, use the replacement instead.
    return spdx(
      licenseReplacements.get(strippedLicense) ?? strippedLicense,
      allowedLicensesSpdxExpression,
    );
  } catch {
    return false;
  }
}
