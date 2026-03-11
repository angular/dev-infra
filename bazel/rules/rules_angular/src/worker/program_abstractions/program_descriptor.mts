import ts from 'typescript';
import {TsStructureIsReused} from './structure_reused.mjs';

export interface ProgramDescriptorCtor {
  new (...args: ConstructorParameters<typeof ProgramDescriptor>): ProgramDescriptor;
}

export abstract class ProgramDescriptor {
  constructor(
    protected rootNames: string[],
    protected options: ts.CompilerOptions,
    protected host: ts.CompilerHost,
    protected oldProgram: ProgramDescriptor | undefined,
  ) {}

  abstract init(): Promise<void>;
  abstract getPreEmitDiagnostics(
    cancellationToken: ts.CancellationToken | undefined,
  ): ts.Diagnostic[];
  abstract emit(cancellationToken: ts.CancellationToken | undefined): ts.EmitResult;
  abstract isStructureReused(): TsStructureIsReused;
}
