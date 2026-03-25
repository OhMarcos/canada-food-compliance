import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TimeBasedCache, hashKey } from "./cache";

describe("TimeBasedCache", () => {
  let cache: TimeBasedCache<string>;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new TimeBasedCache<string>({ ttlMs: 1000, maxEntries: 3 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and retrieves values", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("returns undefined for missing keys", () => {
    expect(cache.get("nonexistent")).toBeUndefined();
  });

  it("expires entries after TTL", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");

    vi.advanceTimersByTime(1001);
    expect(cache.get("key1")).toBeUndefined();
  });

  it("supports custom TTL per entry", () => {
    cache.set("short", "expires-fast", 500);
    cache.set("long", "expires-slow", 2000);

    vi.advanceTimersByTime(600);
    expect(cache.get("short")).toBeUndefined();
    expect(cache.get("long")).toBe("expires-slow");
  });

  it("evicts LRU entries when at max capacity", () => {
    cache.set("a", "1");
    cache.set("b", "2");
    cache.set("c", "3");

    // All three should exist
    expect(cache.size).toBe(3);

    // Adding a 4th should evict the oldest ("a")
    cache.set("d", "4");
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe("2");
    expect(cache.get("d")).toBe("4");
  });

  it("promotes accessed entries (LRU ordering)", () => {
    cache.set("a", "1");
    cache.set("b", "2");
    cache.set("c", "3");

    // Access "a" to promote it
    cache.get("a");

    // Now "b" is the oldest and should be evicted
    cache.set("d", "4");
    expect(cache.get("a")).toBe("1");
    expect(cache.get("b")).toBeUndefined();
  });

  it("has() returns true for existing, unexpired keys", () => {
    cache.set("key1", "value1");
    expect(cache.has("key1")).toBe(true);
    expect(cache.has("missing")).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(cache.has("key1")).toBe(false);
  });

  it("delete() removes a specific entry", () => {
    cache.set("key1", "value1");
    expect(cache.delete("key1")).toBe(true);
    expect(cache.get("key1")).toBeUndefined();
    expect(cache.delete("nonexistent")).toBe(false);
  });

  it("prune() removes all expired entries", () => {
    cache.set("a", "1", 500);
    cache.set("b", "2", 1500);

    vi.advanceTimersByTime(600);
    const pruned = cache.prune();
    expect(pruned).toBe(1);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe("2");
  });

  it("clear() removes all entries", () => {
    cache.set("a", "1");
    cache.set("b", "2");
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get("a")).toBeUndefined();
  });

  it("uses defaults when no options provided", () => {
    const defaultCache = new TimeBasedCache<string>();
    defaultCache.set("key", "value");
    expect(defaultCache.get("key")).toBe("value");
  });
});

describe("hashKey", () => {
  it("returns a string", () => {
    expect(typeof hashKey("test")).toBe("string");
  });

  it("returns consistent hashes for the same input", () => {
    expect(hashKey("hello")).toBe(hashKey("hello"));
  });

  it("returns different hashes for different inputs", () => {
    expect(hashKey("hello")).not.toBe(hashKey("world"));
  });

  it("handles empty string", () => {
    expect(typeof hashKey("")).toBe("string");
    expect(hashKey("")).toBe(hashKey(""));
  });
});
