import {FileCache} from './file_cache/file_cache.mjs';
import {executeBuild, OptionalAngular} from './loop.mjs';
import {getArgsFromParamsFile} from './params_arg_file.mjs';
import {
  createProgramCache,
  evictRecentlyUsedEntriesToFreeUpSpace,
  ProgramCache,
} from './program_cache.mjs';
import worker from './protocol/worker.cjs';
import {MAX_WORKER_MEMORY} from './worker_memory.mjs';

export async function bootWorker(optionalAngular?: OptionalAngular) {
  if (!worker.isPersistentWorker(process.argv)) {
    const isRemoteExecution = process.cwd().startsWith('/b/f/w/');

    // Detect if we run outside sandbox and without RBE.
    // This is disallowed as it can result in TS picking up unrelated files,
    // specifically on Windows.
    if (!isRemoteExecution && !process.cwd().includes('sandbox')) {
      throw new Error(`It's disallowed to compile outside of sandbox/or outside of a worker.`);
    }

    const exitCode = await executeBuild(getArgsFromParamsFile(), null, optionalAngular);
    process.exitCode = exitCode;
  }

  if (worker.isPersistentWorker(process.argv)) {
    const fileCache = new FileCache();
    const programCache: ProgramCache = createProgramCache();

    worker.enterWorkerLoop(async (r) => {
      if (r.inputs === undefined) {
        throw new Error('No inputs specified in `WorkRequest`.');
      }

      // Make debugging easier. Forward console error output to the worker
      // response.
      console.error = (...args) => {
        r.output.write(`${args.join(' ')}\n`);
      };

      const result = await executeBuild(
        r.arguments,
        {
          fileCache,
          programCache,
          req: r,
        },
        optionalAngular,
      );

      if (process.memoryUsage().heapUsed > MAX_WORKER_MEMORY) {
        evictRecentlyUsedEntriesToFreeUpSpace(programCache);
      }

      return result;
    });
  }
}
