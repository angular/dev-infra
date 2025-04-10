/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import childProcess from 'node:child_process';
import path from 'node:path';
import {debug} from './debug.mjs';
import {getCaseExactRealpath} from './file_system_utils.mjs';

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
export function expandEnvironmentVariableSubstitutions(
  args: string[],
  env: NodeJS.ProcessEnv,
): string[] {
  return args.map((content) => {
    return content.replace(environmentVariableSubstitutionRegex, (_, variableName) => {
      if (env[variableName] === undefined) {
        throw new Error(`Could not find substituted environment variable: ${variableName}`);
      }
      return env[variableName]!;
    });
  });
}

/**
 * Runs the given command as a child process in the specified working directory.
 * @returns a Promise that resolves with a boolean indicating whether the
 *   command completed successfully or not.
 */
export async function runCommandInChildProcess(
  binary: string,
  args: string[],
  workingDir: string,
  env: NodeJS.ProcessEnv,
): Promise<boolean> {
  const humanReadableCommand = `${binary}${args.length ? ` ${args.join(' ')}` : ''}`;
  // Note: We resolve the working directory to a case-exact system `realpath`. This is
  // necessary as otherwise Node module resolution could behave unexpectedly when invoked
  // tools down-the-line resolve files with an actual system realpath. Here is an example
  // within Microsoft's `playwright`: https://github.com/microsoft/playwright/issues/9193.
  const normalizedWorkingDir = await getCaseExactRealpath(path.posix.normalize(workingDir));

  debug(`Executing command: ${humanReadableCommand} in ${normalizedWorkingDir}`);

  return new Promise<boolean>((resolve) => {
    const commandProcess = childProcess.spawn(binary, args, {
      shell: true,
      stdio: 'inherit',
      cwd: normalizedWorkingDir,
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
    bash: `${path.posix.normalize(binaryFilePath)} "$@"`,
  };
}
