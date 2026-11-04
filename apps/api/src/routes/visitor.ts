import { type Context } from "hono";
import { type AppEnv } from "../lib/types";
import { type Visitor } from "../services/visitor";

export function visitorFrom(c: Context<AppEnv>): Visitor {
  return { ip: c.get("clientIp"), userAgent: c.req.header("user-agent") ?? "" };
}
