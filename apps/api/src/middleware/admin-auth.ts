import { timingSafeEqual } from "node:crypto";
import { ADMIN_API_KEY_HEADER } from "@devlog/shared/schemas";
import { type MiddlewareHandler } from "hono";
import { HttpError } from "../lib/http-error";
import { type AppEnv } from "../lib/types";

function keysMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on unequal lengths; the key length is public (fixed-length random hex).
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Requires `x-admin-api-key` to equal the configured key. Disabled (always 401) when unset. */
export function adminAuth(apiKey: string | undefined): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const provided = c.req.header(ADMIN_API_KEY_HEADER);
    if (!apiKey || !provided || !keysMatch(provided, apiKey)) {
      throw new HttpError(401, "unauthorized", "Missing or invalid admin API key");
    }
    await next();
  };
}
