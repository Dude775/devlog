import { slugParamsSchema } from "@devlog/shared/schemas";
import { Hono } from "hono";
import { parseInput } from "../lib/http-error";
import { type AppEnv } from "../lib/types";
import { type ViewsService } from "../services/views.service";
import { visitorFrom } from "./visitor";

export function viewsRoutes(service: ViewsService) {
  return new Hono<AppEnv>()
    .get("/:slug", async (c) => {
      const { slug } = parseInput(slugParamsSchema, c.req.param());
      return c.json(await service.get(slug));
    })
    .post("/:slug", async (c) => {
      const { slug } = parseInput(slugParamsSchema, c.req.param());
      return c.json(await service.record(slug, visitorFrom(c)));
    });
}
