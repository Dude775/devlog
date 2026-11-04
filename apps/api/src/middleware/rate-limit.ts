import { type MiddlewareHandler } from "hono";
import { HttpError } from "../lib/http-error";
import { type RateLimitStore } from "../lib/rate-limit/store";
import { type AppEnv } from "../lib/types";

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

/** Per-IP fixed-window limiter. `name` namespaces buckets so rules do not share counters. */
export function rateLimit(
  store: RateLimitStore,
  name: string,
  { limit, windowMs }: RateLimitRule,
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const { count, resetAt } = await store.hit(`${name}:${c.get("clientIp")}`, windowMs);
    const resetSeconds = Math.max(0, Math.ceil((resetAt - Date.now()) / 1000));
    c.header("RateLimit-Limit", String(limit));
    c.header("RateLimit-Remaining", String(Math.max(0, limit - count)));
    c.header("RateLimit-Reset", String(resetSeconds));
    if (count > limit) {
      c.header("Retry-After", String(resetSeconds));
      throw new HttpError(429, "rate_limited", "Too many requests, slow down");
    }
    await next();
  };
}
