import fakePkg from 'fake_pkg';
import fs from 'fs';

// Sanity check that the installed package matches the one we have
// built from source using `pkg_npm`.
if (fakePkg !== 'This is a fake package!') {
  console.error('Fake package is not matching with locally-built one.');
  process.exitCode = 1;
}

const pkgJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const recordsToCheck = ['dependencies', 'devDependencies', 'optionalDependencies', 'resolutions'];

for (const recordName of recordsToCheck) {
  if (Object.values(pkgJson[recordName]).includes('0.0.0')) {
    console.error(`The "${recordName}" field has not been replaced with mapped archives.`);
    process.exitCode = 1;
  }
}
