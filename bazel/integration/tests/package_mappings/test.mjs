import fakePkg from 'fake_pkg';
import fs from 'node:fs';
import {match} from 'node:assert/strict';

// Sanity check that the installed package matches the one we have
// built from source using `pkg_npm`.
if (fakePkg !== 'This is a fake package!') {
  console.error('Fake package is not matching with locally-built one.');
  process.exitCode = 1;
}

const pkgJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const recordsToCheck = ['dependencies', 'devDependencies'];

for (const recordName of recordsToCheck) {
  for (const [name, value] of Object.entries(pkgJson[recordName])) {
    match(
      value,
      /fake_pkg_srcs\/npm_package/,
      `The "${recordName}.${name}" field has not been replaced with mapped archives.`,
    );
  }
}
