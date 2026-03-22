/**
 * Simple LRU cache with TTL expiration.
 * Used for caching regulation section lookups and embedding results.
 * Thread-safe for concurrent access (single-threaded JS runtime,
 * but safe against interleaved async operations).
 */

interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_ENTRIES = 100;

export class TimeBasedCache<T> {
  private readonly cache: Map<string, CacheEntry<T>>;
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor(options?: {
    readonly ttlMs?: number;
    readonly maxEntries?: number;
  }) {
    this.cache = new Map();
    this.ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
    this.maxEntries = options?.maxEntries ?? DEFAULT_MAX_ENTRIES;
  }

  /**
   * Get a value from the cache.
   * Returns undefined if the key doesn't exist or has expired.
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end for LRU ordering (Map preserves insertion order)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  /**
   * Set a value in the cache with optional custom TTL.
   * Evicts the least recently used entry if at capacity.
   */
  set(key: string, value: T, customTtlMs?: number): void {
    // Delete first to update insertion order
    this.cache.delete(key);

    // Evict LRU entries if at capacity
    while (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + (customTtlMs ?? this.ttlMs),
    };
    this.cache.set(key, entry);
  }

  /**
   * Check if a key exists and hasn't expired.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Remove a specific entry.
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Remove all expired entries.
   */
  prune(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Clear all entries.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current number of (potentially expired) entries.
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Create a simple string hash for use as cache keys.
 * Not cryptographic - just for cache key deduplication.
 */
export function hashKey(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(36);
}
