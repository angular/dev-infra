import * as ngtsc from '@angular/compiler-cli';

// Guarding against unexpected scenarios from within the Bazel worker.
export class BazelSafeFilesystem extends ngtsc.NodeJSFileSystem {
  removeFile(path: ngtsc.AbsoluteFsPath): void {
    throw new Error('Not implemented.');
  }
  symlink(target: ngtsc.AbsoluteFsPath, path: ngtsc.AbsoluteFsPath): void {
    throw new Error('Not implemented.');
  }
  copyFile(from: ngtsc.AbsoluteFsPath, to: ngtsc.AbsoluteFsPath): void {
    throw new Error('Not implemented.');
  }
  moveFile(from: ngtsc.AbsoluteFsPath, to: ngtsc.AbsoluteFsPath): void {
    throw new Error('Not implemented.');
  }
  getDefaultLibLocation(): ngtsc.AbsoluteFsPath {
    throw new Error('Not implemented.');
  }
  chdir(path: ngtsc.AbsoluteFsPath): void {
    throw new Error('Not implemented.');
  }
}
