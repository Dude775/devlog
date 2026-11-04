import { createHash, timingSafeEqual } from "node:crypto";
import { ADMIN_API_KEY_HEADER } from "@devlog/shared/schemas";
import { type MiddlewareHandler } from "hono";
import { HttpError } from "../lib/http-error";
import { type AppEnv } from "../lib/types";

const digest = (v: string) => createHash("sha256").update(v).digest();

/** Requires `x-admin-api-key` to equal the configured key. Disabled (always 401) when unset. */
export function adminAuth(apiKey: string | undefined): MiddlewareHandler<AppEnv> {
  const expected = apiKey ? digest(apiKey) : undefined;
  return async (c, next) => {
    const provided = c.req.header(ADMIN_API_KEY_HEADER);
    // Compare fixed-length digests so timing leaks neither content nor length.
    if (!expected || !provided || !timingSafeEqual(digest(provided), expected)) {
      throw new HttpError(401, "unauthorized", "Missing or invalid admin API key");
    }
    await next();
  };
}
