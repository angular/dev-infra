import {
  FileSystem,
  AngularCompilerHostForVanillaCompilations,
} from './angular_foundation_utils.mjs';
import ts from 'typescript';

export type AngularHostFactoryFn = (fs: FileSystem, options: ts.CompilerOptions) => ts.CompilerHost;

/**
 * A compiler host that is used for vanilla TypeScript compilations.
 * It extends the AngularCompilerHostForVanillaCompilations class and overrides
 * the methods in the base class to ensure the correct TS version is used.
 */
class CompilerHostForVanillaCompilations extends AngularCompilerHostForVanillaCompilations {
  constructor(fs: FileSystem, options: ts.CompilerOptions) {
    super(fs, options);
  }

  override getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.fs.join(this.fs.getDefaultLibLocation(), ts.getDefaultLibFileName(options));
  }

  override getSourceFile(
    fileName: string,
    languageVersion: ts.ScriptTarget,
  ): ts.SourceFile | undefined {
    const text = this.readFile(fileName);
    return text !== undefined
      ? ts.createSourceFile(fileName, text, languageVersion, true)
      : undefined;
  }
}

/**
 * Creates a compiler host for the given options and file system.
 * If an Angular factory function is provided, it will be used to create the compiler host.
 * Otherwise, a compiler host for vanilla TypeScript compilations will be created.
 */
export function createBaseCompilerHost(
  options: ts.CompilerOptions,
  fs: FileSystem,
  angularFactoryFn: AngularHostFactoryFn | null,
): ts.CompilerHost {
  const base: ts.CompilerHost = angularFactoryFn
    ? angularFactoryFn(fs, options)
    : // Even for vanilla compilations, we want to use a FS-respecting host. We can
      // just use the one from npm safely then.
      new CompilerHostForVanillaCompilations(fs, options);

  // Support `--traceResolution`.
  base.trace = (output) => console.error(output);

  return base;
}
