import ts from 'typescript';
import {blaze} from './worker_protocol.cjs';
import {Volume} from 'memfs';
import {matchFiles} from './file_system_match_files.mjs';
import fs, {Dirent} from 'fs';
import path from 'path';
import * as ngtsc from '@angular/compiler-cli';
import {AbsoluteFsPath} from '@angular/compiler-cli';
import {BazelSafeFilesystem} from './bazel_safe_filesystem.mjs';

// Original TS file system options. Can be read on file load.
const useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
const typeScriptExecutingFilePath = ts.sys.getExecutingFilePath();

const unsupportedFn = () => {
  throw new Error('Unsupported');
};

export class FileSystem extends BazelSafeFilesystem {
  private _vol = new Volume();
  private _execroot = path.join(process.cwd(), '../../../');

  // `js_binary` always runs with working directory in `bazel-bin`.
  private _bazelBin = process.cwd();
  private _virtualBazelBinRoot = `/${path.relative(this._execroot, this._bazelBin)}`;

  // Never resolve using the real `process.cwd()`. We are in a partially virtual FS,
  // everything is rooted in the bazel-bin.
  resolve(...segments: string[]): ngtsc.AbsoluteFsPath {
    return path.resolve(this._virtualBazelBinRoot, ...segments) as ngtsc.AbsoluteFsPath;
  }

  pwd(): ngtsc.AbsoluteFsPath {
    // The `ts_project` rules passes options like `--project` relative to the bazel-bin,
    // so we will mimic the execution running with this as working directory.
    return this._virtualBazelBinRoot as ngtsc.AbsoluteFsPath;
  }

  readdir(path: ngtsc.AbsoluteFsPath): ngtsc.PathSegment[] {
    return this._vol.readdirSync(this.resolve(path)) as ngtsc.PathSegment[];
  }

  stat(path: ngtsc.AbsoluteFsPath): ngtsc.FileStats {
    return this._vol.statSync(this.resolve(path));
  }

  lstat(path: ngtsc.AbsoluteFsPath): ngtsc.FileStats {
    return this._vol.lstatSync(this.resolve(path));
  }

  addFile(filePath: string): void {
    filePath = this.resolve(filePath);

    if (this.exists(filePath)) {
      return;
    }

    // Ensure the base directory exists in the virtual volume.
    const parentDir = path.dirname(filePath);
    this._vol.mkdirSync(parentDir, {recursive: true});

    const stat = this.diskLstat(filePath);

    if (stat?.isSymbolicLink()) {
      const symlink = this.diskReadlink(filePath);
      this.addFile(symlink);
      this._vol.symlinkSync(symlink, filePath);
    } else if (stat?.isDirectory()) {
      this._vol.mkdirSync(filePath);
    } else {
      this._vol.writeFileSync(filePath, '<>', {encoding: 'utf8'});
    }
  }

  readFile(filePath: ngtsc.AbsoluteFsPath): string {
    // TODO: guard bazel inputs
    return fs.readFileSync(this.toDiskPath(filePath), {encoding: 'utf8'}) as string;
  }

  writeFile(
    path: ngtsc.AbsoluteFsPath,
    data: string | Uint8Array,
    exclusive?: boolean | undefined,
  ): void {
    // TODO: guard
    fs.writeFileSync(this.toDiskPath(path), data, exclusive ? {flag: 'wx'} : undefined);
  }

  exists(filePath: string): boolean {
    return this._vol.existsSync(this.resolve(filePath));
  }

  existsDirectory(filePath: string): boolean {
    try {
      const stat = this._vol.statSync(this.resolve(filePath));
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  realpath(filePath: AbsoluteFsPath): AbsoluteFsPath {
    return this._vol.realpathSync(this.resolve(filePath), {
      encoding: 'utf8',
    }) as AbsoluteFsPath;
  }

  readDirectory(
    path: string,
    extensions?: readonly string[],
    exclude?: readonly string[],
    include?: readonly string[],
    depth?: number,
  ): string[] {
    if (matchFiles === undefined) {
      throw Error(
        'Unable to read directory in virtual file system host. This means that ' +
          'TypeScript changed its file matching internals.\n\nPlease consider downgrading your ' +
          'TypeScript version, and report an issue in the Angular Components repository.',
      );
    }

    return matchFiles!(
      this.resolve(path),
      extensions,
      exclude,
      include,
      useCaseSensitiveFileNames,
      '/',
      depth,
      (p) => this.getDirectoryEntries(p),
      (p) => this.realpath(p as AbsoluteFsPath),
      (p) => this.existsDirectory(p),
    );
  }

  toTypeScriptSystem(): ts.System {
    return {
      getCurrentDirectory: () => this.pwd(),
      getExecutingFilePath: () => this.fromDiskPath(typeScriptExecutingFilePath),
      resolvePath: this.resolve.bind(this),

      // Read operations. Using virtual FS.
      realpath: this.realpath.bind(this),
      fileExists: this.exists.bind(this),
      readDirectory: this.readDirectory.bind(this),
      directoryExists: this.existsDirectory.bind(this),
      getDirectories: (p) => [...this.getDirectoryEntries(p).directories],
      // NOTE: Real FS, but guarded for hermeticity.
      readFile: this.readFile.bind(this),

      // Watch operations: None
      watchFile: unsupportedFn,
      watchDirectory: unsupportedFn,

      // Write operations
      // Note: Real FS, but guarded for hermeticity.
      createDirectory: unsupportedFn,
      writeFile: this.writeFile.bind(this),

      // Arbitrary options
      useCaseSensitiveFileNames: useCaseSensitiveFileNames,
      write: console.log.bind(console),
      exit: unsupportedFn,
      newLine: '\n',
      args: [],
    };
  }

  private getDirectoryEntries(filePath: string): ts.FileSystemEntries {
    const entries = this._vol.readdirSync(this.resolve(filePath), {
      withFileTypes: true,
    }) as Dirent[];
    const directories: string[] = [];
    const files: string[] = [];

    for (const e of entries) {
      if (e.isDirectory()) {
        directories.push(e.name);
      } else if (e.isFile() || e.isSymbolicLink()) {
        files.push(e.name);
      }
    }

    return {directories, files};
  }

  private diskLstat(filePath: string): fs.Stats | null {
    try {
      return fs.lstatSync(this.toDiskPath(filePath));
    } catch {
      return null;
    }
  }

  private diskReadlink(filePath: string): string {
    return this.fromDiskPath(fs.readlinkSync(this.toDiskPath(filePath)));
  }

  private toDiskPath(filePath: string): string {
    return path.join(this._execroot, this.resolve(filePath));
  }

  private fromDiskPath(diskPath: string): string {
    return `/${path.relative(this._execroot, diskPath)}`;
  }

  static initialize(inputs: blaze.worker.WorkRequest['inputs']): FileSystem {
    const fs = new FileSystem();
    for (const f of inputs) {
      fs.addFile(`/${f.path}`);
    }
    return fs;
  }
}
