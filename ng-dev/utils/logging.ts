/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {styleText} from 'util';
import {createWriteStream, WriteStream, copyFileSync} from 'fs';
import {join} from 'path';
import {Arguments} from 'yargs';
import {determineRepoBaseDirFromCwd} from './repo-directory.js';
import {stripVTControlCharacters} from 'util';
import {registerCompletedFunction} from './yargs.js';

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

/** Reexport of colors/styling for convenient access. */
export const red = styleText.bind(null, 'red');
export const green = styleText.bind(null, 'green');
export const yellow = styleText.bind(null, 'yellow');
export const bold = styleText.bind(null, 'bold');
export const blue = styleText.bind(null, 'blue');
export const underline = styleText.bind(null, 'underline');

/** Class used for logging to the console and to a ng-dev log file. */
export abstract class Log {
  /** Write to the console for at INFO logging level */
  static info = buildLogLevelFunction(() => console.info, LogLevel.INFO, null);

  /** Write to the console for at ERROR logging level */
  static error = buildLogLevelFunction(() => console.error, LogLevel.ERROR, red);

  /** Write to the console for at DEBUG logging level */
  static debug = buildLogLevelFunction(() => console.debug, LogLevel.DEBUG, null);

  /** Write to the console for at LOG logging level */
  static log = buildLogLevelFunction(() => console.log, LogLevel.LOG, null);

  /** Write to the console for at WARN logging level */
  static warn = buildLogLevelFunction(() => console.warn, LogLevel.WARN, yellow);
}

/** Build an instance of a logging function for the provided level. */
function buildLogLevelFunction(
  loadCommand: () => Function,
  level: LogLevel,
  defaultColor: ((text: string) => string) | null,
) {
  /** Write to stdout for the LOG_LEVEL. */
  return (...values: unknown[]) => {
    runConsoleCommand(
      loadCommand,
      level,
      // For string values, apply the default color.
      ...values.map((v) => (typeof v === 'string' && defaultColor ? defaultColor(v) : v)),
    );
  };
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
 * The writeable stream for the log file. Starts as undefined before being trigger for usage by
 * `captureLogOutputForCommand` which runs from yargs execution.
 */
let logStream: WriteStream | undefined = undefined;

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
  if (logStream !== undefined) {
    return;
  }
  const repoDir = determineRepoBaseDirFromCwd();
  const logFilePath = join(repoDir, '.ng-dev.log');
  logStream = createWriteStream(logFilePath, {encoding: 'utf-8'});

  /** The date time used for timestamping when the command was invoked. */
  const now = new Date();
  /** Header line to separate command runs in log files. */
  const headerLine = Array(100).fill('#').join('');
  appendToLogFile(
    undefined,
    `${headerLine}\nCommand: ${argv.$0} ${argv._.join(' ')}\nRan at: ${now}\n`,
  );

  // When the command is completed, write the logged output to the appropriate log files
  registerCompletedFunction(async (error) => {
    if (error instanceof Error) {
      appendToLogFile(LogLevel.ERROR, error.message);
      const stack = error.stack?.split('\n') ?? [];
      for (const line of stack) {
        appendToLogFile(LogLevel.ERROR, line);
      }
    }
    appendToLogFile(
      undefined,
      `\n\nCommand ran in ${new Date().getTime() - now.getTime()}ms\nExit Code: ${process.exitCode}\n`,
    );
    logStream!.end(() => {
      // For failure codes greater than 1, the new logged lines should be written to a specific log
      // file for the command run failure.
      if (process.exitCode !== 0) {
        const errorLogFileName = `.ng-dev.err-${now.getTime()}.log`;
        console.error(
          `Exit code: ${process.exitCode}.\nWriting full log to ${join(repoDir, errorLogFileName)}`,
        );
        copyFileSync(logFilePath, join(repoDir, errorLogFileName));
      }
    });
  });
}

/** Write the provided text to the log file, prepending each line with the log level.  */
function appendToLogFile(logLevel: LogLevel | undefined, ...text: unknown[]) {
  if (logStream === undefined) {
    return;
  }
  if (logLevel === undefined) {
    logStream.write(text.join(' ') + '\n');
    return;
  }

  const logLevelText = `${LogLevel[logLevel]}:`.padEnd(LOG_LEVEL_COLUMNS);
  logStream.write(
    stripVTControlCharacters(
      text
        .join(' ')
        .split('\n')
        .map((l) => `${logLevelText} ${l}\n`)
        .join(''),
    ),
  );
}
