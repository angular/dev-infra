import ts from 'typescript';
import {FileCache} from './cache/file_cache.mjs';

export function createCacheCompilerHost(
  options: ts.CompilerOptions,
  cache: FileCache,
  sys: ts.System,
): ts.CompilerHost {
  const base: ts.CompilerHost = /* TODO */ (ts as any).createCompilerHostWorker(options, sys);
  const originalGetSourceFile = base.getSourceFile;

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

    const createdFile = originalGetSourceFile.call(
      this,
      fileName,
      languageVersionOrOptions,
      onError,
      shouldCreateNewSourceFile,
    );

    if (createdFile !== undefined) {
      cache.putCache(fileName, {
        digest: cache.getLastDigest(fileName),
        value: createdFile,
      });
    }

    return createdFile;
  };

  return base;
}
