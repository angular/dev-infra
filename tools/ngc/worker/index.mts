import worker from './worker.cjs';
import * as ngtsc from '@angular/compiler-cli';
import ts from 'typescript';
import {FileSystem} from './file_system.mjs';
import {createCacheCompilerHost} from './cache_compiler_host.mjs';
import {FileCache} from './cache/file_cache.mjs';
import {createCancellationToken} from './cancellation_token.mjs';
import {diffWorkerInputsForModifiedResources} from './modified_resources.mjs';

class WorkerEntry {
  constructor(public program: ngtsc.NgtscProgram, public lastInputs: Map<string, Uint8Array>) {}
}

const cacheProgram = new Map<string, WorkerEntry>();
const fileCache = new FileCache();

if (!worker.isPersistentWorker(process.argv)) {
  if (!process.cwd().includes('sandbox')) {
    throw new Error(`It's disallowed to compile outside of sandbox/or outside of a worker.`);
  }

  // TODO: Normal sandbox execution. RBE executes in a worker?
}

if (worker.isPersistentWorker(process.argv)) {
  worker.enterWorkerLoop(async (r) => {
    if (r.inputs === undefined) {
      throw new Error('No inputs specified in `WorkRequest`.');
    }

    const args = r.arguments;
    const project = args[args.indexOf('--project') + 1];
    const outDir = args[args.lastIndexOf('--outDir') + 1];
    const declarationDir = args[args.lastIndexOf('--declarationDir') + 1];
    const rootDir = args[args.lastIndexOf('--rootDir') + 1];
    const workerKey = `${project} @ ${outDir} @ ${declarationDir} @ ${rootDir}`;
    const existing = cacheProgram.get(workerKey);

    // Make debugging easier. Forward console error output to the worker response.
    console.error = (...args) => {
      r.output.write(`\n${args.join(' ')}\n`);
    };

    const inputs = new Map<string, Uint8Array>(
      r.inputs
        // Worker input paths are rooted in our virtual FS and in the TS compilation.
        .map((i) => [`/${i.path}`, i.digest]),
    );

    const command = ts.parseCommandLine(args);
    const fs = FileSystem.initialize(inputs.keys());
    const tsSystem = fs.toTypeScriptSystem();

    const modifiedResourceFilePaths =
      existing !== undefined
        ? diffWorkerInputsForModifiedResources(inputs, existing.lastInputs)
        : null;

    // Update cache, evicting changed files and their AST.
    fileCache.updateCache(inputs);

    // Ngtsc virtual FS does not properly wire up `ts.readDirectory`, so we manually patch it globally via `ts.sys`.
    // https://source.corp.google.com/piper///depot/google3/third_party/javascript/angular2/rc/packages/compiler-cli/src/perform_compile.ts;l=147?q=readCon%20f:angular&ss=piper%2FGoogle%2FPiper
    ts.sys = {readDirectory: tsSystem.readDirectory} as ts.System;

    // Populate options from command line arguments.
    const parsedConfig = ngtsc.readConfiguration(command.options.project!, command.options, fs);
    const options = parsedConfig.options;

    // Invalidate the system to ensure we always use the virtual FS/host.
    // TODO: Update Angular compiler CLI to properly use FS..
    ts.sys = undefined as unknown as ts.System;

    const formatHost: ts.FormatDiagnosticsHost = {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: () => fs.pwd(),
      getNewLine: () => tsSystem.newLine,
    };

    if (parsedConfig.errors.length) {
      r.output.write(ts.formatDiagnosticsWithColorAndContext(parsedConfig.errors, formatHost));
      return 1;
    }

    const host = createCacheCompilerHost(options, fileCache, tsSystem, modifiedResourceFilePaths);

    r.output.write(`Root names: ${parsedConfig.rootNames.join(', ')}\n`);
    r.output.write(`Re-using program & host: ${!!existing}\n`);

    const program = new ngtsc.NgtscProgram(
      parsedConfig.rootNames,
      options,
      host,
      existing?.program,
    );

    if (existing !== undefined) {
      existing.program = program;
      existing.lastInputs = inputs;
    } else {
      cacheProgram.set(workerKey, new WorkerEntry(program, inputs));
    }

    const cancellationToken = createCancellationToken(r.signal);

    const tsPreEmitDiagnostics = [
      ...program.getTsSyntacticDiagnostics(undefined, cancellationToken),
      ...program.getTsSemanticDiagnostics(undefined, cancellationToken),
      ...program.getTsProgram().getGlobalDiagnostics(cancellationToken),
    ];
    if (tsPreEmitDiagnostics.length !== 0) {
      r.output.write(ts.formatDiagnosticsWithColorAndContext(tsPreEmitDiagnostics, formatHost));
      return 1;
    }

    // Ensure analyzing first.
    await program.loadNgStructureAsync();

    const ngPreEmitDiagnostics = [
      ...program.getNgStructuralDiagnostics(cancellationToken),
      ...program.getNgSemanticDiagnostics(undefined, cancellationToken),
    ];
    if (ngPreEmitDiagnostics.length !== 0) {
      r.output.write(ts.formatDiagnosticsWithColorAndContext(ngPreEmitDiagnostics, formatHost));
      return 1;
    }

    // Emit.
    const emitRes = program.emit({
      cancellationToken,
      forceEmit: true,
    });

    if (emitRes.diagnostics.length !== 0) {
      r.output.write(ts.formatDiagnosticsWithColorAndContext(emitRes.diagnostics, formatHost));
      return 1;
    }

    return emitRes.emitSkipped ? 1 : 0;
  });
}
