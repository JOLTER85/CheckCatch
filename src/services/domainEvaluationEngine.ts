/**
 * High-Performance Two-Word Domain Evaluation Engine
 * 
 * Features:
 * 1. Parallel Processing: Executes linguistic checks, 2-word rules, and valuation via Promise.all
 * 2. Caching Layer: Bounded LRU/FIFO in-memory caches for words, decomposition, and valuations
 * 3. Fast O(1) Dictionary Lookups: Set-based Lookups with pre-calculated tech & commercial roots
 * 4. Batch & Streaming Helpers: Non-blocking async concurrency chunks & NDJSON streaming support
 */

import { SingleDomainVerificationResult, ValuationTier } from '../types';

// ============================================================================
// 1. Generic Bounded LRU-Style Cache
// ============================================================================
export class BoundedCache<K, V> {
  private map = new Map<K, V>();
  private hits = 0;
  private misses = 0;

  constructor(
    public readonly maxEntries: number = 25000,
    public readonly purgeCount: number = 2500
  ) {}

  get(key: K): V | undefined {
    const value = this.map.get(key);
    if (value !== undefined) {
      this.hits++;
      // Re-insert to keep recently accessed items at end (LRU behavior in JS Map)
      this.map.delete(key);
      this.map.set(key, value);
      return value;
    }
    this.misses++;
    return undefined;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  set(key: K, value: V): void {
    if (this.map.size >= this.maxEntries) {
      // Purge oldest entries
      const iter = this.map.keys();
      for (let i = 0; i < this.purgeCount; i++) {
        const next = iter.next();
        if (next.done) break;
        this.map.delete(next.value);
      }
    }
    this.map.set(key, value);
  }

  clear(): void {
    this.map.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    return {
      size: this.map.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(3) : "0.000",
    };
  }
}

// Global caches for rapid lookups across requests
export const wordValidityCache = new BoundedCache<string, boolean>(40000, 4000);
export const atomicWordCache = new BoundedCache<string, boolean>(40000, 4000);
export const twoWordDecomposeCache = new BoundedCache<string, [string, string] | null>(60000, 6000);
export const domainVerificationCache = new BoundedCache<string, any>(20000, 2000);
export const nicheMatchCache = new BoundedCache<string, { isMatch: boolean; bonus: number; matched: string[] }>(10000, 1000);

// ============================================================================
// 2. Fast O(1) Sets for Root Dictionary Lookups
// ============================================================================

export const INVALID_WORD_PARTS = new Set([
  "ing", "ed", "ly", "er", "es", "est", "tion", "ness", "ment", "able", "ible",
  "al", "ic", "ive", "ous", "ful", "less", "ish", "ist", "ism", "ity", "ty",
  "ize", "ise", "ate", "dom"
]);

export const VALID_TWO_LETTER_WORDS = new Set([
  "ai", "go", "my", "up", "in", "on", "by", "to", "we", "do", "so", "no", "re",
  "co", "io", "ex", "me", "us", "it", "at", "as", "he", "is", "am", "an", "ox"
]);

export const MODERN_TECH_ROOTS_SET = new Set([
  "saas", "tech", "app", "web", "net", "dev", "bot", "crypto", "ai", "io", "ops",
  "bio", "eco", "cyber", "meta", "sync", "hub", "lab", "labs", "pro", "fit", "fin",
  "med", "doc", "docs", "stack", "pay", "vibe", "zen", "node", "grid", "mesh",
  "link", "flow", "byte", "flux", "pulse", "core", "spark", "forge", "nova", "apex"
]);

export const HIGH_VALUE_WORDS_SET = new Set([
  "hub", "labs", "lab", "cloud", "flow", "grid", "scale", "wave", "link", "core",
  "base", "desk", "sync", "shift", "spot", "craft", "stack", "prime", "point",
  "vault", "sphere", "mint", "zone", "pulse", "force", "dock", "scope", "nest",
  "mark", "view", "track", "cast", "room", "deck", "leap", "line", "crest",
  "works", "drive", "space", "mate", "code", "app", "web", "net", "dot", "pixel",
  "screen", "bot", "auto", "block", "chain", "token", "asset", "ledger", "bazaar",
  "exchange", "saas", "tech", "dev", "crypto", "ai", "io", "pay", "coin", "bank",
  "fund", "cash", "lend", "safe", "cure", "care", "heal", "med", "life", "bio",
  "gene", "fit", "run", "sport", "game", "play", "win", "bet", "pro", "max",
  "fast", "speed", "quick", "rush", "dash", "deal", "trade", "swap", "share",
  "send", "post", "mail", "cart", "buy", "sell", "shop", "store", "mart", "work",
  "job", "hire", "team", "crew", "club", "group", "hive", "bench", "trust",
  "shield", "guard", "ward", "secure", "pure", "real", "wise", "brain", "mind",
  "think", "idea", "lead", "first", "alpha", "omega", "edge", "front", "venture",
  "capital", "angel", "launch", "rocket", "star", "sun", "moon", "sea", "ocean"
]);

// ============================================================================
// 3. Parallel Batch Processing Utilities
// ============================================================================

/**
 * Executes async tasks over an array in parallel chunks, yielding to the event loop
 * between chunks to prevent blocking server I/O and prevent HTTP timeouts.
 */
export async function mapInParallelChunks<T, R>(
  items: T[],
  chunkSize: number,
  fn: (item: T, index: number) => Promise<R> | R
): Promise<R[]> {
  const results: R[] = [];
  const total = items.length;

  for (let i = 0; i < total; i += chunkSize) {
    const slice = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      slice.map((item, idx) => fn(item, i + idx))
    );
    results.push(...chunkResults);

    // Yield control to the event loop if more chunks remain
    if (i + chunkSize < total) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  }

  return results;
}

/**
 * Generates an NDJSON chunk stream for large domain evaluation batches
 */
export async function* streamDomainEvaluationChunks<T, R>(
  items: T[],
  chunkSize: number,
  processor: (chunk: T[], startIndex: number) => Promise<R[]>
): AsyncGenerator<string, void, unknown> {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const results = await processor(chunk, i);
    yield JSON.stringify({
      chunkIndex: Math.floor(i / chunkSize),
      chunkOffset: i,
      chunkSize: chunk.length,
      totalItems: items.length,
      data: results,
    }) + "\n";

    await new Promise((resolve) => setImmediate(resolve));
  }
}
