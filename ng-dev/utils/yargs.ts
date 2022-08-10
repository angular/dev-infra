import yargs, {Arguments, Argv} from 'yargs';

// A function to be called when the command completes.
type CompletedFn = (err: Error | null) => Promise<void> | void;

/** List of functions to be called upon command completion. */
const completedFunctions: CompletedFn[] = [];

/** Register a function to be called when the command completes. */
export function registerCompletedFunction(fn: CompletedFn) {
  completedFunctions.push(fn);
}

/**
 * Run the yargs process, as configured by the supplied function, calling a set of completion
 * functions after the command completes.
 */
export function runParserWithCompletedFunctions(applyConfiguration: (argv: Argv) => Argv) {
  applyConfiguration(yargs([])).parse(process.argv.slice(2), async (err: Error | null) => {
    for (const completedFunc of completedFunctions) {
      await completedFunc(err);
    }
  });
}
