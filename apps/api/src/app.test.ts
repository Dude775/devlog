import { healthResponseSchema, readinessResponseSchema } from "@devlog/shared/schemas";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import { createHealthService } from "./services/health.service";

function buildApp(dbUp: boolean) {
  const health = createHealthService({
    repository: { pingDatabase: () => Promise.resolve(dbUp) },
    version: "9.9.9",
    uptime: () => 42.123456,
  });
  return createApp({ services: { health }, corsOrigins: [], enableLogger: false });
}

describe("GET /health", () => {
  it("returns status, version and uptime", async () => {
    const res = await buildApp(true).request("/health");
    expect(res.status).toBe(200);
    const body = healthResponseSchema.parse(await res.json());
    expect(body).toEqual({ status: "ok", version: "9.9.9", uptime: 42.123 });
  });
});

describe("GET /health/ready", () => {
  it("returns 200 when the database is reachable", async () => {
    const res = await buildApp(true).request("/health/ready");
    expect(res.status).toBe(200);
    expect(readinessResponseSchema.parse(await res.json()).checks.database).toBe("up");
  });

  it("returns 503 when the database is down", async () => {
    const res = await buildApp(false).request("/health/ready");
    expect(res.status).toBe(503);
  });
});

describe("unknown routes", () => {
  it("return a typed 404 error", async () => {
    const res = await buildApp(true).request("/nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { code: "not_found", message: "Route not found" } });
  });
});
