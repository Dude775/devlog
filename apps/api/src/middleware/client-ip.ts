import { type MiddlewareHandler } from "hono";
import { type ClientIpResolver } from "../lib/client-ip";
import { type AppEnv } from "../lib/types";

export function clientIp(resolve: ClientIpResolver): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    c.set("clientIp", resolve(c));
    await next();
  };
}
