import ts from 'typescript';
import {blaze} from './worker_protocol.cjs';
import {Volume} from 'memfs';
import {matchFiles} from './file_system_match_files.mjs';
import fs from 'fs';
import path from 'path';
import * as ngtsc from '@angular/compiler-cli';
import {AbsoluteFsPath} from '@angular/compiler-cli';
import {BazelSafeFilesystem} from './bazel_safe_filesystem.mjs';

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
    // We are operating in the virtual bazel bin root.
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
      ts.sys.useCaseSensitiveFileNames,
      '/',
      depth,
      // TODO:
      (p) => ({directories: [], files: ['tools/ngc_test/main.ts']}),
      (p) => this.realpath(p as AbsoluteFsPath),
      (p) => this.existsDirectory(p),
    );
  }

  toTypeScriptSystem(): ts.System {
    return {
      ...ts.sys,
      getCurrentDirectory: () => '/',
      getExecutingFilePath: () => this.fromDiskPath(typeScriptExecutingFilePath),

      // Read operations. Using virtual FS.
      realpath: this.realpath.bind(this),
      fileExists: this.exists.bind(this),
      readDirectory: this.readDirectory.bind(this),
      // Read operations, guarding hermetic operations, but real FS:
      readFile: this.readFile.bind(this),
      // Watch operations: None
      watchFile: unsupportedFn,
      watchDirectory: unsupportedFn,
    };
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
    return path.join(this._execroot, filePath);
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
