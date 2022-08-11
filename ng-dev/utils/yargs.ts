import yargs, {Arguments, Argv} from 'yargs';
import {Log} from './logging.js';

// A function to be called when the command completes.
type CompletedFn = (err: Error | null) => Promise<void> | void;

/** List of functions to be called upon command completion. */
const completedFunctions: CompletedFn[] = [];

/** Register a function to be called when the command completes. */
export function registerCompletedFunction(fn: CompletedFn) {
  completedFunctions.push(fn);
}

/** Error to be thrown when yargs completes without running a command. */
export class YargsError extends Error {
  constructor() {
    super('Error is parse or validation of command');
  }
}

/**
 * Run the yargs process, as configured by the supplied function, calling a set of completion
 * functions after the command completes.
 */
export function runParserWithCompletedFunctions(applyConfiguration: (argv: Argv) => Argv) {
  applyConfiguration(yargs([])).parse(
    process.argv.slice(2),
    async (err: Error | null, _: Arguments, output: string) => {
      if (err && [undefined, 0].includes(process.exitCode)) {
        process.exitCode = 1;
      }
      if (err) {
        Log.debug(err);
      }
      if (output) {
        err = err || new YargsError();
        Log.log(output);
      }
      for (const completedFunc of completedFunctions) {
        await completedFunc(err);
      }
    },
  );
}
