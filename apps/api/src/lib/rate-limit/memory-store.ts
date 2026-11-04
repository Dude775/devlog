import { type RateLimitHit, type RateLimitStore } from "./store";

export interface MemoryStoreOptions {
  /** Upper bound on tracked keys to cap memory under an IP-spray attack. */
  maxKeys?: number;
  /** How often expired windows are swept. */
  sweepIntervalMs?: number;
  now?: () => number;
}

/** Fixed-window counter in process memory. */
export function createMemoryRateLimitStore({
  maxKeys = 50_000,
  sweepIntervalMs = 60_000,
  now = Date.now,
}: MemoryStoreOptions = {}): RateLimitStore & { size: () => number } {
  const windows = new Map<string, RateLimitHit>();

  const sweep = () => {
    const t = now();
    for (const [key, w] of windows) if (w.resetAt <= t) windows.delete(key);
  };
  const timer = setInterval(sweep, sweepIntervalMs);
  timer.unref();

  return {
    hit(key, windowMs) {
      const t = now();
      const current = windows.get(key);
      if (current && current.resetAt > t) {
        current.count += 1;
        return Promise.resolve({ ...current });
      }
      if (!current && windows.size >= maxKeys) {
        sweep();
        // Still full: evict the oldest insertion (Map preserves insertion order).
        if (windows.size >= maxKeys) {
          const oldest = windows.keys().next();
          if (!oldest.done) windows.delete(oldest.value);
        }
      }
      const fresh = { count: 1, resetAt: t + windowMs };
      windows.delete(key);
      windows.set(key, fresh);
      return Promise.resolve({ ...fresh });
    },
    close() {
      clearInterval(timer);
      windows.clear();
      return Promise.resolve();
    },
    size: () => windows.size,
  };
}
