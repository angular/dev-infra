const {fork} = require('child_process');

// Wrapper script to workaround a bug in `rules_nodejs` where `.cjs`
// vendored files are not detected and launched as binaries (breaking Windows).
// TODO: Remove once https://github.com/bazelbuild/rules_nodejs/pull/3350 is available.
fork(__dirname + '/releases/yarn-3.2.0.cjs', process.argv.slice(2));
