import ts from 'typescript';
import {FileCache} from './cache/file_cache.mjs';

export function createCacheCompilerHost(
  options: ts.CompilerOptions,
  cache: FileCache,
  sys: ts.System,
): ts.CompilerHost {
  const base: ts.CompilerHost = /* TODO */ (ts as any).createCompilerHostWorker(options, true, sys);
  const originalGetSourceFile = base.getSourceFile;
  const defaultLibLocation = base.getDefaultLibLocation?.();

  // This should never happen as `ts.createCompilerHost` always sets it.
  if (defaultLibLocation === undefined) {
    throw new Error('Could not determine default TypeScript lib location.');
  }

  base.getSourceFile = function (
    fileName: string,
    languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
    onError?: (message: string) => void,
    shouldCreateNewSourceFile?: boolean,
  ): ts.SourceFile | undefined {
    // Used cached source file if it's still valid.
    const cachedFile = cache.getCache(fileName);
    if (cachedFile !== undefined) {
      return cachedFile;
    }

    const isLibFile = defaultLibLocation !== undefined && fileName.startsWith(defaultLibLocation);
    const createdFile = originalGetSourceFile.call(
      this,
      fileName,
      languageVersionOrOptions,
      onError,
      shouldCreateNewSourceFile,
    );

    if (createdFile !== undefined) {
      // Note: For library files, we will never have a digest. This is because the library is not
      // part of the `WorkRequest` inputs, but rather is part of the worker `js_binary`. To make
      // sure lib files can be cached, we assign an arbitrary digest. The entry would never be evicted
      // by `cache.updateCache` anyway. Bazel will invalidate the worker when the TS package changes.
      const digest = isLibFile ? new Uint8Array() : cache.getLastDigest(fileName);

      cache.putCache(fileName, {
        digest,
        value: createdFile,
      });
    }

    return createdFile;
  };

  return base;
}
