import { getConnInfo } from "@hono/node-server/conninfo";
import { type Context } from "hono";

export type ClientIpResolver = (c: Context) => string;

const UNKNOWN = "unknown";

/**
 * Resolve the caller's IP. With `trustProxy`, the left-most X-Forwarded-For entry wins
 * (only safe behind a proxy that overwrites the header); otherwise the socket address.
 */
export function createClientIpResolver({ trustProxy }: { trustProxy: boolean }): ClientIpResolver {
  return (c) => {
    if (trustProxy) {
      const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
      if (forwarded) return forwarded;
    }
    try {
      return getConnInfo(c).remote.address ?? UNKNOWN;
    } catch {
      // Not running on @hono/node-server (e.g. app.request() in tests).
      return UNKNOWN;
    }
  };
}
