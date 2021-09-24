import {spawnSync} from './child-process';

// TODO: Use typescript import after bazelbuild/bazelisk#271 is completed.
const {getNativeBinary} = require('@bazel/bazelisk/bazelisk.js');

/** The absolute path to the local binary for bazel. */
let bazelBinPath: undefined | string;

/** Run a bazel command. */
export function bazel(cmd: string, args: string[]) {
  bazelBinPath = bazelBinPath || (getNativeBinary() as string);
  const {status, stdout, stderr} = spawnSync(bazelBinPath, [cmd, ...args]);

  if (status === 0) {
    return stdout.trim();
  }

  throw Error(stderr);
}
