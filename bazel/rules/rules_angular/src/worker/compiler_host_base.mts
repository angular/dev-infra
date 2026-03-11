import {
  FileSystem,
  AngularCompilerHostForVanillaCompilations,
} from './angular_foundation_utils.mjs';
import ts from 'typescript';

export type AngularHostFactoryFn = (fs: FileSystem, options: ts.CompilerOptions) => ts.CompilerHost;

export function createBaseCompilerHost<Host extends ts.CompilerHost>(
  options: ts.CompilerOptions,
  fs: FileSystem,
  angularFactoryFn: AngularHostFactoryFn | null,
): ts.CompilerHost {
  const base: ts.CompilerHost = angularFactoryFn
    ? angularFactoryFn(fs, options)
    : // Even for vanilla compilations, we want to use a FS-respecting host. We can
      // just use the one from npm safely then.
      new AngularCompilerHostForVanillaCompilations(fs, options);

  // Support `--traceResolution`.
  base.trace = (output) => console.error(output);

  return base;
}
