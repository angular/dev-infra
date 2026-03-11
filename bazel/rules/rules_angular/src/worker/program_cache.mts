import {ProgramDescriptor} from './program_abstractions/program_descriptor.mjs';
import {LRUCache} from 'lru-cache';

export class WorkerProgramCacheEntry {
  constructor(
    public program: ProgramDescriptor,
    public lastInputs: Map<string, Uint8Array>,
  ) {}
}

export type ProgramCache = LRUCache<string, WorkerProgramCacheEntry>;

export function createProgramCache(): ProgramCache {
  return new LRUCache<string, WorkerProgramCacheEntry>({
    max: 50,
    // 30min. TTL option allows us to find older entries and evict them earlier if we detect memory limit boundaries.
    ttl: 1000 * 60 * 30,
  });
}

export function evictRecentlyUsedEntriesToFreeUpSpace(cache: ProgramCache) {
  const oldestEntries = Array.from(cache.keys())
    .map((k) => [k, cache.getRemainingTTL(k)] as const)
    .sort((a, b) => a[1] - b[1]);

  if (oldestEntries.length === 0) {
    throw new Error('Unexpected program cache eviction without any entries cached.');
  }

  for (let i = 0; i < oldestEntries.length / 2; i++) {
    cache.delete(oldestEntries[i][0]);
  }
}
