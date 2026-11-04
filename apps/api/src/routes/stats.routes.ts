import { Hono } from "hono";
import { type AppEnv } from "../lib/types";
import { type StatsService } from "../services/stats.service";

export function statsRoutes(service: StatsService) {
  return new Hono<AppEnv>().get("/", async (c) => {
    c.header("cache-control", "no-store");
    return c.json(await service.get());
  });
}
