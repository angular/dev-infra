const fs = require('fs');

if (process.env.CUSTOM_VAR !== 'yes!') {
  console.error('The expected `CUSTOM_VAR` environment variable is not set.');
  process.exit(1);
}

if (process.env.RESOLVED_BIN === undefined) {
  console.error('The expected `RESOLVED_BIN` variable is not set.');
  process.exit(1);
}

if (require(process.env.RESOLVED_BIN).name !== 'semver') {
  console.error('The `RESOLVED_BIN` file did not resolve to the "package.json" of "semver".');
  process.exit(1);
}

if (process.env.MANUAL_ROOT_PATH !== '../npm/node_modules/semver/package.json') {
  console.error('Expected `MANUAL_ROOT_PATH` to be unmodified as it is not an expanded value.');
  process.exit(1);
}

if (!process.env.HOME.includes('.tmp-env-')) {
  console.error('Expected `HOME` to point to a temporary environment directory.');
  process.exit(1);
}

const bazeliskHome = process.env.BAZELISK_HOME;
const bazeliskHome_2 = process.env.BAZELISK_HOME_2;

if (!fs.statSync(bazeliskHome).isDirectory()) {
  console.error('Expected `BAZELISK_HOME` environment variable to point to a temp directory.');
  process.exit(1);
}

if (!fs.statSync(bazeliskHome_2).isDirectory()) {
  console.error('Expected `BAZELISK_HOME_2` environment variable to point to a temp directory.');
  process.exit(1);
}

if (bazeliskHome === bazeliskHome_2) {
  console.error('Expected the bazelisk home variables to point to different temp directories.');
  process.exit(1);
}
