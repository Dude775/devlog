import { addReactionRequestSchema, slugParamsSchema } from "@devlog/shared/schemas";
import { Hono } from "hono";
import { parseInput, readJson } from "../lib/http-error";
import { type AppEnv } from "../lib/types";
import { type ReactionsService } from "../services/reactions.service";
import { visitorFrom } from "./visitor";

export function reactionsRoutes(service: ReactionsService) {
  return new Hono<AppEnv>()
    .get("/:slug", async (c) => {
      const { slug } = parseInput(slugParamsSchema, c.req.param());
      return c.json(await service.get(slug));
    })
    .post("/:slug", async (c) => {
      const { slug } = parseInput(slugParamsSchema, c.req.param());
      const { type } = parseInput(addReactionRequestSchema, await readJson(c));
      return c.json(await service.add(slug, type, visitorFrom(c)));
    });
}
