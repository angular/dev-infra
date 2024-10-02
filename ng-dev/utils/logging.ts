/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import chalk, {ChalkInstance} from 'chalk';
import {copyFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {Arguments} from 'yargs';
import {determineRepoBaseDirFromCwd} from './repo-directory.js';
import {appendFile} from 'fs/promises';
import {stripVTControlCharacters} from 'util';

/**
 * Supported levels for logging functions. Levels are mapped to
 * numbers to represent a hierarchy of logging levels.
 */
export enum LogLevel {
  SILENT = 0,
  ERROR = 1,
  WARN = 2,
  LOG = 3,
  INFO = 4,
  DEBUG = 5,
}

/** Default log level for the tool. */
export const DEFAULT_LOG_LEVEL = LogLevel.INFO;

/** Reexport of chalk colors for convenient access. */
export const red = chalk.red;
export const reset = chalk.reset;
export const green = chalk.green;
export const yellow = chalk.yellow;
export const bold = chalk.bold;
export const blue = chalk.blue;
export const underline = chalk.underline;

/** Class used for logging to the console and to a ng-dev log file. */
export abstract class Log {
  /** Write to the console for at INFO logging level */
  static info = buildLogLevelFunction(() => console.info, LogLevel.INFO, null);

  /** Write to the console for at ERROR logging level */
  static error = buildLogLevelFunction(() => console.error, LogLevel.ERROR, chalk.red);

  /** Write to the console for at DEBUG logging level */
  static debug = buildLogLevelFunction(() => console.debug, LogLevel.DEBUG, null);

  /** Write to the console for at LOG logging level */
  static log = buildLogLevelFunction(() => console.log, LogLevel.LOG, null);

  /** Write to the console for at WARN logging level */
  static warn = buildLogLevelFunction(() => console.warn, LogLevel.WARN, chalk.yellow);
}

/** Build an instance of a logging function for the provided level. */
function buildLogLevelFunction(
  loadCommand: () => Function,
  level: LogLevel,
  defaultColor: ChalkInstance | null,
) {
  /** Write to stdout for the LOG_LEVEL. */
  const loggingFunction = (...values: unknown[]) => {
    runConsoleCommand(
      loadCommand,
      level,
      // For string values, apply the default color.
      ...values.map((v) => (typeof v === 'string' && defaultColor ? defaultColor(v) : v)),
    );
  };

  /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
  loggingFunction.group = (label: string, collapsed = false) => {
    const command = collapsed ? console.groupCollapsed : console.group;
    runConsoleCommand(() => command, level, defaultColor ? defaultColor(label) : label);
  };

  /** End the group at the LOG_LEVEL. */
  loggingFunction.groupEnd = () => {
    runConsoleCommand(() => console.groupEnd, level);
  };

  return loggingFunction;
}

/**
 * Run the console command provided, if the environments logging level greater than the
 * provided logging level.
 *
 * The loadCommand takes in a function which is called to retrieve the console.* function
 * to allow for jasmine spies to still work in testing.  Without this method of retrieval
 * the console.* function, the function is saved into the closure of the created logging
 * function before jasmine can spy.
 */
function runConsoleCommand(loadCommand: () => Function, logLevel: LogLevel, ...text: unknown[]) {
  if (getLogLevel() >= logLevel) {
    loadCommand()(...text);
  }
  appendToLogFile(logLevel, ...text);
}

/**
 * Retrieve the log level from environment variables, if the value found
 * based on the LOG_LEVEL environment variable is undefined, return the default
 * logging level.
 */
function getLogLevel(): LogLevel {
  const logLevel = Object.keys(LogLevel).indexOf((process.env[`LOG_LEVEL`] || '').toUpperCase());
  if (logLevel === -1) {
    return DEFAULT_LOG_LEVEL;
  }
  return logLevel;
}

/**
 * The number of columns used in the prepended log level information on each line of the logging
 * output file.
 */
const LOG_LEVEL_COLUMNS = 7;
/**
 * The path to the log file being written to live. Starts as undefined before being trigger for usage by
 * `captureLogOutputForCommand` which runs from yargs execution.
 */
let logFilePath: string | undefined = undefined;

/**
 * Enable writing the logged outputs to the log file on process exit, sets initial lines from the
 * command execution, containing information about the timing and command parameters.
 *
 * This is expected to be called only once during a command run, and should be called by the
 * middleware of yargs to enable the file logging before the rest of the command parsing and
 * response is executed.
 */
export async function captureLogOutputForCommand(argv: Arguments) {
  // TODO(josephperrott): remove this guard against running multiple times after
  //   https://github.com/yargs/yargs/issues/2223 is fixed
  if (logFilePath !== undefined) {
    return;
  }
  const repoDir = determineRepoBaseDirFromCwd();
  logFilePath = join(repoDir, '.ng-dev.log');
  writeFileSync(logFilePath, '');

  /** The date time used for timestamping when the command was invoked. */
  const now = new Date();
  /** Header line to separate command runs in log files. */
  const headerLine = Array(100).fill('#').join('');
  appendToLogFile(
    undefined,
    `${headerLine}\nCommand: ${argv.$0} ${argv._.join(' ')}\nRan at: ${now}\n`,
  );

  // On process exit, write the logged output to the appropriate log files
  process.on('exit', (code: number) => {
    appendToLogFile(
      undefined,
      `\n\nCommand ran in ${new Date().getTime() - now.getTime()}ms\nExit Code: ${code}\n`,
    );

    // For failure codes greater than 1, the new logged lines should be written to a specific log
    // file for the command run failure.
    if (code > 1 && logFilePath) {
      const errorLogFileName = `.ng-dev.err-${now.getTime()}.log`;
      console.error(`Exit code: ${code}. Writing full log to ${errorLogFileName}`);
      copyFileSync(logFilePath, join(repoDir, errorLogFileName));
    }
  });
}

/** Write the provided text to the log file, prepending each line with the log level.  */
function appendToLogFile(logLevel: LogLevel | undefined, ...text: unknown[]) {
  if (logFilePath === undefined) {
    return;
  }
  if (logLevel === undefined) {
    appendFile(logFilePath, text.join(' '));
    return;
  }

  const logLevelText = `${LogLevel[logLevel]}:`.padEnd(LOG_LEVEL_COLUMNS);
  appendFile(
    logFilePath,
    // Strip ANSI escape codes from log outputs.
    stripVTControlCharacters(
      text
        .join(' ')
        .split('\n')
        .map((l) => `${logLevelText} ${l}\n`)
        .join(''),
    ),
  );
}
