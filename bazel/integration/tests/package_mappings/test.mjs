import fakePkg from 'fake_pkg';

// Sanity check that the installed package matches the one we have
// built from source using `pkg_npm`.
if (fakePkg !== 'This is a fake package!') {
  console.error('Fake package is not matching with locally-built one.');
  process.exitCode = 1;
}
