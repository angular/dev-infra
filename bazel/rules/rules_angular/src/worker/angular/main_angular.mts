import * as ngtsc from '@angular/compiler-cli';

import assert from 'assert';
import ts from 'typescript';

import {bootWorker} from '../with_user_compiler/worker.mjs';
import {ProgramDescriptor} from '../with_user_compiler/program_abstractions/program_descriptor.mjs';
import {TsStructureIsReused} from '../with_user_compiler/program_abstractions/structure_reused.mjs';

export class AngularProgram extends ProgramDescriptor {
  private _ngtscProgram: ngtsc.NgtscProgram | null = null;

  async init(): Promise<void> {
    this._ngtscProgram = new ngtsc.NgtscProgram(
      this.rootNames,
      this.options,
      this.host,
      this.oldProgram instanceof AngularProgram
        ? (this.oldProgram._ngtscProgram ?? undefined)
        : undefined,
    );
    // Ensure analyzing before collecting diagnostics.
    await this._ngtscProgram.loadNgStructureAsync();
  }

  getPreEmitDiagnostics(cancellationToken: ts.CancellationToken | undefined): ts.Diagnostic[] {
    assert(this._ngtscProgram, 'Expected ngtsc program to be initialized.');

    return [
      ...this._ngtscProgram.getTsSyntacticDiagnostics(undefined, cancellationToken),
      ...this._ngtscProgram.getTsSemanticDiagnostics(undefined, cancellationToken),
      ...this._ngtscProgram.getTsProgram().getGlobalDiagnostics(cancellationToken),
      ...this._ngtscProgram.getNgStructuralDiagnostics(cancellationToken),
      ...this._ngtscProgram.getNgSemanticDiagnostics(undefined, cancellationToken),
    ];
  }

  emit(cancellationToken: ts.CancellationToken | undefined): ts.EmitResult {
    assert(this._ngtscProgram, 'Expected ngtsc program to be initialized.');
    return this._ngtscProgram.emit({cancellationToken, forceEmit: true});
  }

  isStructureReused(): TsStructureIsReused {
    assert(this._ngtscProgram, 'Expected ngtsc program to be initialized.');
    return (this._ngtscProgram?.getTsProgram() as any)['structureIsReused'];
  }
}

// Boot up worker.
await bootWorker({
  angularHostFactoryFn: (fs, options) => new ngtsc.NgtscCompilerHost(fs, options),
  programCtor: AngularProgram,
});
