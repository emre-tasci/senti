interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// Use globalThis to persist cache across HMR in dev mode
const globalStore = globalThis as unknown as { __cache?: Map<string, CacheEntry<unknown>> };
if (!globalStore.__cache) {
  globalStore.__cache = new Map();
}
const store = globalStore.__cache;

export function getCache<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  store.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}
