/**
 * Cache exposes a trivial LRU cache.
 *
 * This code uses the fact that JavaScript hash maps are linked lists - after
 * reaching the cache size limit, it deletes the oldest (first) entries. Used
 * cache entries are moved to the end of the list by deleting and re-inserting.
 */
export class Cache<T> {
  private map = new Map<string, T>();

  constructor(private name: string) {}

  set(key: string, value: T) {
    this.map.set(key, value);
  }

  get(key: string, updateCache = true): T | undefined {
    const entry = this.map.get(key);
    if (updateCache) {
      if (entry) {
        // Move an entry to the end of the cache by deleting and re-inserting
        // it.
        this.map.delete(key);
        this.map.set(key, entry);
      }
    }
    return entry;
  }

  delete(key: string) {
    this.map.delete(key);
  }

  evict(fraction = 2): number {
    const originalSize = this.map.size;
    let numberKeysToDrop = Math.ceil(originalSize / fraction);
    if (numberKeysToDrop === 0) {
      return 0;
    }
    // Map keys are iterated in insertion order. Since we reinsert on access
    // this is indeed a LRU strategy.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys
    for (const key of this.map.keys()) {
      if (numberKeysToDrop === 0) break;
      this.map.delete(key);
      numberKeysToDrop--;
    }
    const keysDropped = originalSize - this.map.size;
    return keysDropped;
  }

  keys() {
    return this.map.keys();
  }
}
