import ts from 'typescript';

// We use TypeScript's native `ts.matchFiles` utility for the virtual file system
// hosts, as that function implements complex logic for matching files with respect
// to root directory, extensions, excludes, includes etc. The function is currently
// internal but we can use it as the API most likely will not change any time soon,
// nor does it seem like this is being made public any time soon.
// Related issue for tracking: https://github.com/microsoft/TypeScript/issues/13793.
// https://github.com/microsoft/TypeScript/blob/b397d1fd4abd0edef85adf0afd91c030bb0b4955/src/compiler/utilities.ts#L6192
declare module 'typescript' {
  export interface FileSystemEntries {
    readonly files: readonly string[];
    readonly directories: readonly string[];
  }

  export const matchFiles:
    | undefined
    | ((
        path: string,
        extensions: readonly string[] | undefined,
        excludes: readonly string[] | undefined,
        includes: readonly string[] | undefined,
        useCaseSensitiveFileNames: boolean,
        currentDirectory: string,
        depth: number | undefined,
        getFileSystemEntries: (path: string) => FileSystemEntries,
        realpath: (path: string) => string,
        directoryExists: (path: string) => boolean,
      ) => string[]);
}

export const matchFiles: typeof ts.matchFiles = ts.matchFiles;
