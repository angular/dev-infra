/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as childProcess from 'child_process';
import * as path from 'path';
import {debug} from './debug';

/**
 * Regular expression matching environment variable substitutions
 * which follow the following format: `${VAR_NAME}`.
 */
const environmentVariableSubstitutionRegex = /\${(\w+)}/g;

/**
 * Expands environment variable substitutions for the list of command
 * line arguments. Returns the transformed list of arguments.
 *
 * @throws An error if a substituted environment variable does not exist.
 */
export function expandEnvironmentVariableSubstitutions(args: string[]): string[] {
  return args.map((content) => {
    return content.replace(environmentVariableSubstitutionRegex, (_, variableName) => {
      if (process.env[variableName] === undefined) {
        throw new Error(`Could not find substituted environment variable: ${variableName}`);
      }
      return process.env[variableName]!;
    });
  });
}

/**
 * Runs the given command as a child process in the specified working directory.
 * @returns a Promise that resolves with a boolean indicating whether the
 *   command completed successfully or not.
 */
export function runCommandInChildProcess(
  binary: string,
  args: string[],
  workingDir: string,
  env: NodeJS.ProcessEnv,
): Promise<boolean> {
  const humanReadableCommand = `${binary} ${args.join(' ')}`;

  debug(`Executing command: ${humanReadableCommand} in ${workingDir}`);

  return new Promise<boolean>((resolve) => {
    const commandProcess = childProcess.spawn(binary, args, {
      shell: true,
      stdio: 'inherit',
      cwd: workingDir,
      env,
    });

    commandProcess.on('close', (status) => resolve(status === 0));
  });
}

/** Prepends the given path to the specified `PATH` environment variable. */
export function prependToPathVariable(pathToAdd: string, existingPathVar: string): string {
  return `${pathToAdd}${path.delimiter}${existingPathVar}`;
}

/**
 * Gets the contents of a script that passes-through to the given binary file.
 * This is useful when generating tool mappings for `$PATH` that cannot be
 * symlinked as that would throw off other relative file path assumptions.
 */
export function getBinaryPassThroughScript(binaryFilePath: string) {
  return {
    cmd: `@echo off\nCALL "${path.win32.normalize(binaryFilePath)}" %*`,
    bash: `${path.posix.normalize(binaryFilePath)} $@`,
  };
}
