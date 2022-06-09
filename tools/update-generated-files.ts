/**
 * Script that finds all `generated_file_test` targets and runs their `.update` targets.
 * This is useful if a dependency that is bundled into all checked-in bundles has been
 * updated. All of the checked-in bundles would need to be updated and it's cumbersome
 * to manually run all of these targets.
 */

import {join} from 'path';
import {fileURLToPath} from 'url';

import {spawnSync, SpawnSyncOptionsWithStringEncoding} from 'child_process';

const currentDir = fileURLToPath(import.meta.url);
const projectDir = join(currentDir, '../');
const bazelPath = process.env.BAZEL ?? join(projectDir, 'node_modules/.bin/bazel');
const spawnOptions: SpawnSyncOptionsWithStringEncoding = {
  encoding: 'utf8',
  cwd: projectDir,
  shell: true,
};

const queryProcess = spawnSync(
  bazelPath,
  ['query', `"kind(nodejs_binary, //...) intersect attr(name, '.update$', //...)"`],
  spawnOptions,
);

if (queryProcess.status !== 0) {
  throw Error(`Unexpected error: ${queryProcess.error ?? queryProcess.stderr}`);
}

const updateTargets = queryProcess.stdout.trim().split(/\r?\n/);

for (const targetName of updateTargets) {
  const proc = spawnSync(bazelPath, ['run', targetName], {...spawnOptions, stdio: 'inherit'});
  if (proc.status !== 0) {
    throw Error(`Unexpected error while updating: ${targetName}.`);
  }
}
