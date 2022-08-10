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
export async function runParserWithCompletedFunctions(applyConfiguration: (argv: Argv) => Argv) {
  let err: Error | null = null;
  try {
    await applyConfiguration(yargs(process.argv.slice(2)))
      .exitProcess(false)
      .parse();
  } catch (e) {
    err = e as Error;
    if ([undefined, 0].includes(process.exitCode)) {
      process.exitCode = 1;
    }
  } finally {
    for (const completedFunc of completedFunctions) {
      await completedFunc(err);
    }
  }
}
