import { type ContactResponse, contactRequestSchema } from "@devlog/shared/schemas";
import { Hono } from "hono";
import { parseInput, readJson } from "../lib/http-error";
import { type AppEnv } from "../lib/types";
import { type ContactService } from "../services/contact.service";

export function contactRoutes(service: ContactService) {
  return new Hono<AppEnv>().post("/", async (c) => {
    const input = parseInput(contactRequestSchema, await readJson(c));
    const { status, spam } = await service.submit(input);
    c.get("logger").info({ spam }, "contact message");
    return c.json<ContactResponse>({ status }, 202);
  });
}
