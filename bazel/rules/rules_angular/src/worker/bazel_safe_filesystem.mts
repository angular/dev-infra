import {NodeJSFileSystem, AbsoluteFsPath} from './angular_foundation_utils.mjs';

// Guarding against unexpected scenarios from within the Bazel worker.
export class BazelSafeFilesystem extends NodeJSFileSystem {
  removeFile(path: AbsoluteFsPath): void {
    throw new Error('Not implemented.');
  }
  symlink(target: AbsoluteFsPath, path: AbsoluteFsPath): void {
    throw new Error('Not implemented.');
  }
  copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    throw new Error('Not implemented.');
  }
  moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    throw new Error('Not implemented.');
  }
  chdir(path: AbsoluteFsPath): void {
    throw new Error('Not implemented.');
  }
  removeDeep() {
    throw new Error('Not implemented');
  }
}
