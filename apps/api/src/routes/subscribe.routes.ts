import { type SubscribeResponse, subscribeRequestSchema } from "@devlog/shared/schemas";
import { Hono } from "hono";
import { parseInput, readJson } from "../lib/http-error";
import { type AppEnv } from "../lib/types";
import { type NewsletterService } from "../services/newsletter.service";

export function subscribeRoutes(service: NewsletterService) {
  return new Hono<AppEnv>().post("/", async (c) => {
    const input = parseInput(subscribeRequestSchema, await readJson(c));
    const { status, outcome } = await service.subscribe(input);
    c.get("logger").info({ outcome }, "newsletter subscribe");
    return c.json<SubscribeResponse>({ status }, 202);
  });
}
