import { type MiddlewareHandler } from "hono";
import { type Logger } from "pino";
import { type AppEnv } from "../lib/types";

/** Attaches a request-scoped child logger (bound to the request id) and logs one line per request. */
export function requestLogger(base: Logger): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const start = performance.now();
    const log = base.child({ reqId: c.get("requestId") });
    c.set("logger", log);
    await next();
    const status = c.res.status;
    const entry = {
      method: c.req.method,
      path: c.req.path,
      status,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
    if (status >= 500) log.error(entry, "request failed");
    else if (status >= 400) log.warn(entry, "request rejected");
    else log.info(entry, "request completed");
  };
}
