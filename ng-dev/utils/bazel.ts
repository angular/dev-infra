import {spawnSync} from './child-process';
import {getNativeBinary} from '@bazel/bazelisk';

/** The absolute path to the local binary for bazel. */
let bazelBinPath: undefined | string;

/** Run a bazel command. */
export function bazel(cmd: string, args: string[]) {
  bazelBinPath = bazelBinPath || getNativeBinary();
  const {status, stdout, stderr} = spawnSync(bazelBinPath, [cmd, ...args]);

  if (status === 0) {
    return stdout.trim();
  }

  throw Error(stderr);
}
