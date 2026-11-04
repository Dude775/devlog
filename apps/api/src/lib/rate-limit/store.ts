export interface RateLimitHit {
  /** Hits in the current window, including this one. */
  count: number;
  /** Epoch ms when the window resets. */
  resetAt: number;
}

/**
 * Pluggable rate-limit backend. The in-memory store suits a single instance; a Redis store
 * (INCR + PEXPIRE) can implement the same interface for horizontal scaling.
 */
export interface RateLimitStore {
  hit: (key: string, windowMs: number) => Promise<RateLimitHit>;
  close: () => Promise<void>;
}
