/**
 * @fileoverview
 *
 * Foundational utilities from compiler CLI that are used in the worker
 * to e.g. implement the virtual file system efficient caching.
 *
 * These utilities do not affect the compilation output in an Angular-specific
 * way. When the worker is running in Angular mode, the compiler version configured
 * via `WORKSPACE` is made available through the `/angular` package and the `OptionalAngular`
 * object.
 */

import {CompilerHost} from '@angular/compiler-cli';

export {
  type AbsoluteFsPath,
  type FileStats,
  type PathSegment,
  type CompilerOptions,
  type FileSystem,
  // These two runtime objects will always be used from our npm version.
  // This is acceptable and low risk given type checking against the real compiler.
  NodeJSFileSystem,
  setFileSystem,
  readConfiguration,
  NgtscCompilerHost as AngularCompilerHostForVanillaCompilations,
} from '@angular/compiler-cli';

// Limited type exposing `CompilerHost` Angular features. We can't use this type reliably
// throughout this worker as it transitively would depend on TS specifics of the npm version;
// causing conflicts with a potential compiler-cli from HEAD that uses a more recent TS version.
export type AngularResourceHost = Partial<
  Pick<CompilerHost, 'readResource' | 'getModifiedResourceFiles'>
>;
