import fs from 'fs';
import os from 'os';
import path from 'path';
import {getBazelBin} from '../../utils/bazel-bin.js';
import {ChildProcess} from '../../utils/child-process.js';
import {
  getExcludedDirsForCwd,
  getPathFromEnvironment,
  resolveSafeExecutable,
} from '../../utils/environment.js';
import {Spinner} from '../../utils/spinner.js';
import {Workflow} from './loader.js';

export async function measureWorkflow({name, workflow, prepare, cleanup}: Workflow) {
  const spinner = new Spinner();
  const bazelShimDir = createFallbackBazelBinDir();
  const commandEnv = bazelShimDir
    ? {
        ...process.env,
        PATH: [bazelShimDir, getPathFromEnvironment(process.env)]
          .filter(Boolean)
          .join(path.delimiter),
      }
    : undefined;

  try {
    if (prepare) {
      spinner.update('Preparing environment for workflow execution');
      // Run the `prepare` commands to establish the environment, caching, etc prior to running the
      // workflow.
      await runCommands(prepare, commandEnv);
      spinner.update('Environment preperation completed');
    }

    spinner.update(`Executing workflow (${name})`);
    // Mark the start time of the workflow, execute all of the commands provided in the workflow and
    // then mark the ending time.
    performance.mark('start');
    await runCommands(workflow, commandEnv);
    performance.mark('end');

    spinner.update('Workflow completed');

    if (cleanup) {
      spinner.update('Cleaning up environment after workflow');
      // Run the clean up commands to reset the environment and undo changes made during the workflow.
      await runCommands(cleanup, commandEnv);
      spinner.update('Environment cleanup complete');
    }

    const results = performance.measure(name, 'start', 'end');

    spinner.success(`${name}: ${results.duration.toFixed(2)}ms`);

    return {
      name,
      value: results.duration,
    };
  } finally {
    if (bazelShimDir) {
      fs.rmSync(bazelShimDir, {recursive: true, force: true});
    }
    spinner.complete();
  }
}

/**
 * Exposes the configured `bazel` binary from an isolated temporary directory when no system-wide
 * `bazel` binary exists outside the repository, allowing bare `bazel` workflow steps to run
 * without putting `<repoRoot>/node_modules/.bin` back on `PATH`.
 */
function createFallbackBazelBinDir(): string | null {
  if (resolveSafeExecutable('bazel', process.env, getExcludedDirsForCwd()) !== null) {
    return null;
  }

  let bazelBin: string;
  try {
    bazelBin = getBazelBin();
  } catch {
    return null;
  }

  if (!fs.existsSync(bazelBin)) {
    return null;
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-dev-perf-bazel-'));
  if (process.platform === 'win32') {
    fs.writeFileSync(path.join(tempDir, 'bazel.cmd'), `@"${bazelBin}" %*\r\n`);
  } else {
    fs.symlinkSync(bazelBin, path.join(tempDir, 'bazel'));
  }
  return tempDir;
}

/**
 * Run a set of commands provided as a multiline text block. Commands are assumed to always be
 * provided on a single line.
 */
async function runCommands(commands?: string[], env?: NodeJS.ProcessEnv) {
  if (!commands || commands.length === 0) {
    return;
  }

  for (const cmd of commands) {
    await ChildProcess.exec(cmd, {mode: 'on-error', env});
  }
}
