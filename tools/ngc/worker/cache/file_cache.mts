import {Cache} from './cache.mjs';
import ts from 'typescript';
import path from 'path';
import {blaze} from '../worker_protocol.cjs';

/** Cache entry for `FileCache` */
export interface SourceFileEntry {
  digest: Uint8Array; // blaze's opaque digest of the file
  value: ts.SourceFile;
}

const DEFAULT_MAX_MEM_USAGE = 1024 * (1 << 20); /* 1 MB */

/**
 * FileCache is a trivial LRU cache for typescript-parsed bazel-output files.
 *
 * Cache entries include an opaque bazel-supplied digest to track staleness.
 * Expected digests must be set (using updateCache) before using the cache.
 */
export class FileCache {
  private fileCache = new Cache<SourceFileEntry>('file');
  /**
   * FileCache does not know how to construct Bazel's opaque digests. This
   * field caches the last (or current) compile run's digests, so that code
   * below knows what digest to assign to a newly loaded file.
   */
  protected lastDigests = new Map<string, Uint8Array>();
  /**
   * FileCache can enter a degenerate state, where all cache entries are pinned
   * by lastDigests, but the system is still out of memory. In that case, do not
   * attempt to free memory until lastDigests has changed.
   */
  private cannotEvict = false;

  /**
   * Because we cannot measuse the cache memory footprint directly, we evict
   * when the process' total memory usage goes beyond this number.
   */
  private maxMemoryUsage = DEFAULT_MAX_MEM_USAGE;

  /**
   * Updates the cache with the given digests.
   *
   * updateCache must be called before loading files - only files that were
   * updated (with a digest) previously can be loaded.
   */
  updateCache(digests: blaze.worker.WorkRequest['inputs']): void {
    this.lastDigests = new Map();

    for (const input of digests) {
      // In the worker, execroot paths are absolute in the virtual FS.
      input.path = `/${input.path}`;

      this.lastDigests.set(input.path, input.digest);

      // Evict the file entry if the digest has changed.
      const entry = this.fileCache.get(input.path, /*updateCache=*/ false);
      if (entry && !isSameDigest(entry.digest, input.digest)) {
        console.error('evicting', input.path);
        this.fileCache.delete(input.path);
      }
    }

    this.cannotEvict = false;
  }

  getLastDigest(filePath: string): Uint8Array {
    const digest = this.lastDigests.get(filePath);
    if (!digest) {
      const errorMsg = `missing input digest for ${filePath}. `;
      const entriesToPrint = Array.from(this.lastDigests.keys())
        // Look for files with a similar basename.
        .filter((f) => f.includes(path.basename(filePath)));

      if (entriesToPrint.length > 100) {
        throw new Error(
          errorMsg +
            `(only have: ${entriesToPrint.slice(0, 100)} and ${entriesToPrint.length - 100} more)`,
        );
      }
      throw new Error(errorMsg + `(only have: ${entriesToPrint})`);
    }
    return digest;
  }

  getCache(filePath: string): ts.SourceFile | undefined {
    const entry = this.fileCache.get(filePath, /*updateCache=*/ true);
    if (entry) return entry.value;
    return undefined;
  }

  putCache(filePath: string, entry: SourceFileEntry): void {
    this.maybeFreeMemory();
    this.fileCache.set(filePath, entry);
  }

  inCache(filePath: string): boolean {
    return !!this.getCache(filePath);
  }

  /**
   * Returns whether the cache should free some memory.
   *
   * Defined as a property so it can be overridden in tests.
   */
  shouldFreeMemory: (heapUsage: number) => boolean = (heapUsage: number) => {
    return heapUsage > this.maxMemoryUsage;
  };

  /**
   * Frees memory if required. Returns the number of dropped entries.
   */
  protected maybeFreeMemory() {
    // Fast path: process.memoryUsage() is relatively expensive; don't call it
    // if not necessary.
    if (this.cannotEvict) return 0;

    const heapUsage = process.memoryUsage().heapUsed;
    if (!this.shouldFreeMemory(heapUsage)) return 0;

    const dropped = this.fileCache.evict();
    if (dropped === 0) {
      // Freeing memory did not drop any cache entries, because all are pinned.
      // Stop evicting until the pinned list changes again. This prevents
      // degenerating into an O(n^2) situation where each file load iterates
      // through the list of all files, trying to evict cache keys in vain
      // because all are pinned.
      this.cannotEvict = true;
    }
    return dropped;
  }
}

function isSameDigest(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
