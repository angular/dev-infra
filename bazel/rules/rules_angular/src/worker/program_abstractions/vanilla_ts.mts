import ts from 'typescript';
import {ProgramDescriptor} from './program_descriptor.mjs';
import assert from 'assert';
import {TsStructureIsReused} from './structure_reused.mjs';

export class VanillaTsProgram extends ProgramDescriptor {
  private _tsProgram: ts.Program | null = null;

  async init(): Promise<void> {
    this._tsProgram = ts.createProgram({
      rootNames: this.rootNames,
      options: this.options,
      host: this.host,
      oldProgram:
        this.oldProgram instanceof VanillaTsProgram
          ? (this.oldProgram._tsProgram ?? undefined)
          : undefined,
    });
  }

  getPreEmitDiagnostics(cancellationToken: ts.CancellationToken | undefined): ts.Diagnostic[] {
    assert(this._tsProgram, 'Expected TS program to be initialized.');

    return [
      ...this._tsProgram.getSyntacticDiagnostics(undefined, cancellationToken),
      ...this._tsProgram.getSemanticDiagnostics(undefined, cancellationToken),
      ...this._tsProgram.getGlobalDiagnostics(cancellationToken),
    ];
  }

  emit(cancellationToken: ts.CancellationToken | undefined): ts.EmitResult {
    assert(this._tsProgram, 'Expected TS program to be initialized.');

    return this._tsProgram.emit(undefined, undefined, cancellationToken, false, undefined);
  }

  isStructureReused(): TsStructureIsReused {
    assert(this._tsProgram, 'Expected ngtsc program to be initialized.');
    return (this._tsProgram as any)['structureIsReused'];
  }
}
