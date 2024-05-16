import path from 'path';
import os from 'os';
import fs from 'fs';

// Resolves the cache path to a system absolute path. This is necessary
// for Bazel to properly pick up the path. Note also that backslashes
// in the bazelrc file need to be escaled as otherwise those would escape
// followed characters that weren't supposed to be escaped.
const cachePath = path.join(os.homedir(), '.cache/bazel_repo_cache');
const escapedCachePath = cachePath.replace(/\\/g, '\\\\');

const bazelRcContent = `
# Print all the options that apply to the build.
# This helps us diagnose which options override others
# (e.g. /etc/bazel.bazelrc vs. tools/bazel.rc)
build --announce_rc

# Avoids re-downloading NodeJS/browsers all the time.
build --repository_cache=${escapedCachePath}

# More details on failures
build --verbose_failures=true

# CI supports colors but Bazel does not detect it.
common --color=yes
`;

await fs.promises.mkdir(cachePath, {recursive: true});
await fs.promises.appendFile(process.env.BAZELRC_PATH, bazelRcContent);

console.info('Appended to the Bazel RC file:\n\n');
console.info(bazelRcContent);
