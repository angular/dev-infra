/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import supportsColor from 'supports-color';
import {
  spawn as _spawn,
  SpawnOptions as _SpawnOptions,
  spawnSync as _spawnSync,
  SpawnSyncOptions as _SpawnSyncOptions,
  ExecOptions as _ExecOptions,
  exec as _exec,
  ChildProcess as _ChildProcess,
} from 'child_process';
import {Log} from './logging.js';
import {getExcludedDirsForCwd, sanitizeEnvironmentPath} from './environment.js';
import assert from 'assert';

export interface CommonCmdOpts {
  // Stdin text to provide to the process. The raw text will be written to `stdin` and then
  // the stream is closed. This is equivalent to the `input` option from `SpawnSyncOption`.
  input?: string;
  /** Console output mode. Defaults to "enabled". */
  mode?: 'enabled' | 'silent' | 'on-error';
  /** Whether to prevent exit codes being treated as failures. */
  suppressErrorOnFailingExitCode?: boolean;
  /** When true, suppresses logging `logOutput` to `Log.debug` / `Log.error`. */
  sensitiveOutput?: boolean;
}

/** Interface describing the options for spawning a process synchronously. */
export interface SpawnSyncOptions
  extends CommonCmdOpts, Omit<_SpawnSyncOptions, 'stdio' | 'input'> {}

/** Interface describing the options for spawning a process. */
export interface SpawnOptions extends CommonCmdOpts, Omit<_SpawnOptions, 'stdio'> {}

/** Interface describing the options for exec-ing a process. */
export interface ExecOptions extends CommonCmdOpts, Omit<_ExecOptions, 'stdio'> {}

/** Interface describing the options for spawning an interactive process. */
export interface SpawnInteractiveCommandOptions extends Omit<_SpawnOptions, 'stdio'> {}

/** Interface describing the result of a spawned process. */
export interface SpawnResult {
  /** Captured stdout in string format. */
  stdout: string;
  /** Captured stderr in string format. */
  stderr: string;
  /** The exit code or signal of the process. */
  status: number | NodeJS.Signals;
}

/** Interface describing the result of an exec process. */
export type ExecResult = SpawnResult;

/** Class holding utilities for spawning child processes. */
export abstract class ChildProcess {
  /**
   * Spawns a given command with the specified arguments inside an interactive shell. All process
   * stdin, stdout and stderr output is printed to the current console.
   *
   * @returns a Promise resolving on success, and rejecting on command failure with the status code.
   */
  static spawnInteractive(
    command: string,
    args: string[],
    options: SpawnInteractiveCommandOptions = {},
  ) {
    return new Promise<void>((resolve, reject) => {
      const commandText = `${command} ${args.join(' ')}`;
      const env = sanitizeEnvironmentPath(
        options.env ?? process.env,
        getExcludedDirsForCwd(options.cwd),
      );
      Log.debug(`Executing command: ${sanitize(commandText)}`);
      const childProcess = _spawn(command, args, {...options, env, stdio: 'inherit'});
      childProcess.on('error', (err) => {
        const sanitizedErr = sanitizeError(err);
        Log.debug(`Command "${sanitize(commandText)}" failed with error: ${sanitizedErr.message}`);
        reject(sanitizedErr);
      });
      // The `close` event is used because the process is guaranteed to have completed writing to
      // stdout and stderr, using the `exit` event can cause inconsistent information in stdout and
      // stderr due to a race condition around exiting.
      childProcess.on('close', (status) => (status === 0 ? resolve() : reject(status)));
    });
  }

  /**
   * Spawns a given command with the specified arguments inside a shell synchronously.
   *
   * @returns The command's stdout and stderr.
   */
  static spawnSync(command: string, args: string[], options: SpawnSyncOptions = {}): SpawnResult {
    // Default shell to false to prevent OS command injection: with shell: true, Node.js
    // internally joins command + args into a single string evaluated by /bin/sh, making
    // shell metacharacters in args exploitable. Callers that genuinely require shell
    // features (e.g. sourcing shell scripts) may explicitly pass shell: true.
    const commandText = `${command} ${args.join(' ')}`;
    const env = getEnvironmentForNonInteractiveCommand(options.env, options.cwd);

    Log.debug(`Executing command: ${sanitize(commandText)}`);

    const {
      status: exitCode,
      signal,
      stdout,
      stderr,
    } = _spawnSync(command, args, {...options, env, encoding: 'utf8', stdio: 'pipe'});

    /** The status of the spawn result. */
    const status = statusFromExitCodeAndSignal(exitCode, signal);

    if (status === 0 || options.suppressErrorOnFailingExitCode) {
      return {status, stdout, stderr};
    }

    throw new Error(sanitize(stderr));
  }

  /**
   * Spawns a given command with the specified arguments inside a shell. All process stdout
   * output is captured and returned as resolution on completion. Depending on the chosen
   * output mode, stdout/stderr output is also printed to the console, or only on error.
   *
   * @returns a Promise resolving with captured stdout and stderr on success. The promise
   *   rejects on command failure.
   */
  static spawn(command: string, args: string[], options: SpawnOptions = {}): Promise<SpawnResult> {
    // Default shell to false to prevent OS command injection: with shell: true, Node.js
    // internally joins command + args into a single string evaluated by /bin/sh, making
    // shell metacharacters in args exploitable. Callers that genuinely require shell
    // features (e.g. sourcing shell scripts) may explicitly pass shell: true.
    const commandText = `${command} ${args.join(' ')}`;
    const env = getEnvironmentForNonInteractiveCommand(options.env, options.cwd);

    return processAsyncCmd(
      commandText,
      options,
      _spawn(command, args, {...options, env, stdio: 'pipe'}),
    );
  }

  /**
   * Execs a given command with the specified arguments inside a shell. All process stdout
   * output is captured and returned as resolution on completion. Depending on the chosen
   * output mode, stdout/stderr output is also printed to the console, or only on error.
   *
   * @returns a Promise resolving with captured stdout and stderr on success. The promise
   *   rejects on command failure.
   */
  static exec(command: string, options: ExecOptions = {}): Promise<SpawnResult> {
    const env = getEnvironmentForNonInteractiveCommand(options.env, options.cwd);
    return processAsyncCmd(command, options, _exec(command, {...options, env}));
  }
}

/**
 * Convert the provided exitCode and signal to a single status code.
 *
 * During `exit` node provides either a `code` or `signal`, one of which is guaranteed to be
 * non-null.
 *
 * For more details see: https://nodejs.org/api/child_process.html#child_process_event_exit
 */
function statusFromExitCodeAndSignal(exitCode: number | null, signal: NodeJS.Signals | null) {
  return exitCode ?? signal ?? -1;
}

/**
 * Gets a process environment object with defaults that can be used for
 * spawning non-interactive child processes.
 *
 * Currently we enable `FORCE_COLOR` since non-interactive spawn's with
 * non-inherited `stdio` will not have colors enabled due to a missing TTY.
 */
function getEnvironmentForNonInteractiveCommand(
  userProvidedEnv?: NodeJS.ProcessEnv,
  cwd?: string | URL,
): NodeJS.ProcessEnv {
  // Pass through the color level from the TTY/process performing the `spawn` call.
  const forceColorValue =
    supportsColor.stdout !== false ? supportsColor.stdout.level.toString() : undefined;
  const sanitizedEnv = sanitizeEnvironmentPath(
    userProvidedEnv ?? process.env,
    getExcludedDirsForCwd(cwd),
  );

  return {FORCE_COLOR: forceColorValue, ...sanitizedEnv};
}

/**
 * Process the ChildProcess object created by an async command.
 */
function processAsyncCmd(
  command: string,
  options: CommonCmdOpts,
  childProcess: _ChildProcess,
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    let logOutput = '';
    let stdout = '';
    let stderr = '';

    Log.debug(`Executing command: ${sanitize(command)}`);

    childProcess.on('error', (err) => {
      const sanitizedErr = sanitizeError(err);
      const printFn = options.mode === 'on-error' ? Log.error : Log.debug;
      printFn(`Command "${sanitize(command)}" failed with error: ${sanitizedErr.message}`);
      reject(sanitizedErr);
    });

    // If provided, write `input` text to the process `stdin`.
    if (options.input !== undefined) {
      assert(
        childProcess.stdin,
        'Cannot write process `input` if there is no pipe `stdin` channel.',
      );
      childProcess.stdin.write(options.input);
      childProcess.stdin.end();
    }

    // Capture the stdout separately so that it can be passed as resolve value.
    // This is useful if commands return parsable stdout.
    childProcess.stderr?.on('data', (message) => {
      stderr += message;
      logOutput += message;
      // If console output is enabled, print the message directly to the stderr. Note that
      // we intentionally print all output to stderr as stdout should not be polluted.
      if (options.mode === undefined || options.mode === 'enabled') {
        process.stderr.write(sanitize(String(message)));
      }
    });

    childProcess.stdout?.on('data', (message) => {
      stdout += message;
      logOutput += message;
      // If console output is enabled, print the message directly to the stderr. Note that
      // we intentionally print all output to stderr as stdout should not be polluted.
      if (options.mode === undefined || options.mode === 'enabled') {
        process.stderr.write(sanitize(String(message)));
      }
    });

    // The `close` event is used because the process is guaranteed to have completed writing to
    // stdout and stderr, using the `exit` event can cause inconsistent information in stdout and
    // stderr due to a race condition around exiting.
    childProcess.on('close', (exitCode, signal) => {
      const exitDescription = exitCode !== null ? `exit code "${exitCode}"` : `signal "${signal}"`;
      const status = statusFromExitCodeAndSignal(exitCode, signal);
      const printFn = status !== 0 && options.mode === 'on-error' ? Log.error : Log.debug;
      printFn(`Command "${sanitize(command)}" completed with ${exitDescription}.`);
      if (!options.sensitiveOutput) {
        printFn(`Process output: \n${sanitize(logOutput)}`);
      }

      // On success, resolve the promise. Otherwise reject with the captured stderr
      // and stdout log output if the output mode was set to `silent`.
      if (status === 0 || options.suppressErrorOnFailingExitCode) {
        resolve({stdout, stderr, status});
      } else {
        reject(options.mode === 'silent' ? sanitize(logOutput) : undefined);
      }
    });
  });
}

/**
 * Sanitizes a string by redacting URL credentials, GCP OAuth2 access tokens,
 * GitHub tokens, Authorization headers, `.npmrc` auth directives, and JWTs.
 */
function sanitize(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return value
    .replace(/(https?:\/\/)([^@:/]*)(:[^@/]+)?@/g, '$1<TOKEN>@')
    .replace(/(Authorization\s*:\s*(?:Bearer|Basic)\s+)[^\s'"]+/gi, '$1<REDACTED>')
    .replace(/(:_(?:authToken|password)=)[^\s'"]+/gi, '$1<REDACTED>')
    .replace(/\bya29\.[A-Za-z0-9._-]+\b/g, '<REDACTED_TOKEN>')
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{36,255}\b/g, '<REDACTED_GITHUB_TOKEN>')
    .replace(/\bgithub_pat_[A-Za-z0-9_]{22,255}\b/g, '<REDACTED_GITHUB_PAT>')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '<REDACTED_JWT>');
}

/** Sanitizes an error's message, stack, and any captured output fields. */
function sanitizeError(err: Error): Error {
  if (!(err instanceof Error)) {
    return new Error(sanitize(String(err)));
  }
  const sanitized = new Error(sanitize(err.message));
  sanitized.name = err.name;
  if (err.stack !== undefined) {
    sanitized.stack = sanitize(err.stack);
  }
  const extra = err as NodeJS.ErrnoException & {
    spawnargs?: string[];
    cmd?: string;
    stdout?: string;
    stderr?: string;
  };
  const target = sanitized as NodeJS.ErrnoException & {
    spawnargs?: string[];
    cmd?: string;
    stdout?: string;
    stderr?: string;
  };
  if (extra.code !== undefined) {
    target.code = extra.code;
  }
  if (extra.errno !== undefined) {
    target.errno = extra.errno;
  }
  if (extra.syscall !== undefined) {
    target.syscall = sanitize(extra.syscall);
  }
  if (extra.path !== undefined) {
    target.path = sanitize(extra.path);
  }
  if (extra.cmd !== undefined) {
    target.cmd = sanitize(extra.cmd);
  }
  if (Array.isArray(extra.spawnargs)) {
    target.spawnargs = extra.spawnargs.map((arg: string) => sanitize(arg));
  }
  if (typeof extra.stdout === 'string') {
    target.stdout = sanitize(extra.stdout);
  }
  if (typeof extra.stderr === 'string') {
    target.stderr = sanitize(extra.stderr);
  }
  return sanitized;
}
