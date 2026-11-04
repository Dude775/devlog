import {
  apiErrorSchema,
  healthResponseSchema,
  postViewsResponseSchema,
  reactionsResponseSchema,
  readinessResponseSchema,
  statsResponseSchema,
} from "@devlog/shared/schemas";
import { pino } from "pino";
import { afterEach, describe, expect, it } from "vitest";
import { type AppDeps, createApp, type RateLimitRules, type Services } from "./app";
import { createClientIpResolver } from "./lib/client-ip";
import { createMemoryRateLimitStore } from "./lib/rate-limit/memory-store";
import { type RateLimitStore } from "./lib/rate-limit/store";
import { createVisitorHasher } from "./lib/visitor-hash";
import { createContactService } from "./services/contact.service";
import { createHealthService } from "./services/health.service";
import { createNewsletterService } from "./services/newsletter.service";
import { createReactionsService } from "./services/reactions.service";
import { createStatsService } from "./services/stats.service";
import { createViewsService } from "./services/views.service";
import { createFakeStore } from "./testing/fakes";

const ADMIN_KEY = "a".repeat(40);
const WEB_ORIGIN = "http://web.test";
const stores: RateLimitStore[] = [];

afterEach(async () => {
  await Promise.all(stores.splice(0).map((s) => s.close()));
});

function buildApp({
  dbUp = true,
  rateLimits,
}: { dbUp?: boolean; rateLimits?: Partial<RateLimitRules> } = {}) {
  const fake = createFakeStore();
  const hashVisitor = createVisitorHasher("test-salt".repeat(4));
  const rateLimitStore = createMemoryRateLimitStore();
  stores.push(rateLimitStore);
  const app = createApp({
    services: {
      health: createHealthService({
        repository: { pingDatabase: () => Promise.resolve(dbUp) },
        version: "9.9.9",
        uptime: () => 42.123456,
      }),
      views: createViewsService({ repository: fake.repos.views, hashVisitor }),
      reactions: createReactionsService({ repository: fake.repos.reactions, hashVisitor }),
      newsletter: createNewsletterService({ repository: fake.repos.subscribers }),
      contact: createContactService({ repository: fake.repos.contact }),
      stats: createStatsService({ repository: fake.repos.stats }),
    },
    logger: pino({ level: "silent" }),
    webOrigins: [WEB_ORIGIN],
    adminApiKey: ADMIN_KEY,
    // Tests simulate distinct clients via X-Forwarded-For.
    resolveClientIp: createClientIpResolver({ trustProxy: true }),
    rateLimitStore,
    ...(rateLimits ? { rateLimits } : {}),
  });
  return { app, fake };
}

/** Minimal app for edge cases: only the services a test needs; no admin key unless given. */
function appWith(services: Partial<Services>, overrides: Partial<AppDeps> = {}) {
  const rateLimitStore = createMemoryRateLimitStore();
  stores.push(rateLimitStore);
  return createApp({
    services: services as Services,
    logger: pino({ level: "silent" }),
    webOrigins: [],
    resolveClientIp: () => "1.1.1.1",
    rateLimitStore,
    ...overrides,
  });
}

const client = (ip: string, ua = "vitest") => ({ "x-forwarded-for": ip, "user-agent": ua });
const json = (body: unknown, headers: Record<string, string> = {}) => ({
  method: "POST",
  headers: { "content-type": "application/json", ...headers },
  body: JSON.stringify(body),
});

async function expectError(res: Response, status: number, code: string) {
  expect(res.status).toBe(status);
  const body = apiErrorSchema.parse(await res.json());
  expect(body.error.code).toBe(code);
  return body;
}

describe("health", () => {
  it("GET /health returns status, version and uptime", async () => {
    const res = await buildApp().app.request("/health");
    expect(res.status).toBe(200);
    expect(healthResponseSchema.parse(await res.json())).toEqual({
      status: "ok",
      version: "9.9.9",
      uptime: 42.123,
    });
  });

  it("GET /health/ready is 200 when the database is reachable", async () => {
    const res = await buildApp().app.request("/health/ready");
    expect(res.status).toBe(200);
    expect(readinessResponseSchema.parse(await res.json()).checks.database).toBe("up");
  });

  it("GET /health/ready is 503 when the database is down", async () => {
    const res = await buildApp({ dbUp: false }).app.request("/health/ready");
    expect(res.status).toBe(503);
  });
});

describe("views", () => {
  it("counts a visitor once per day and distinct visitors separately", async () => {
    const { app } = buildApp();
    const first = await app.request("/v1/views/hello-world", {
      method: "POST",
      headers: client("1.1.1.1"),
    });
    expect(postViewsResponseSchema.parse(await first.json()).count).toBe(1);

    await app.request("/v1/views/hello-world", { method: "POST", headers: client("1.1.1.1") });
    const other = await app.request("/v1/views/hello-world", {
      method: "POST",
      headers: client("2.2.2.2"),
    });
    expect(postViewsResponseSchema.parse(await other.json()).count).toBe(2);

    const read = await app.request("/v1/views/hello-world");
    expect(await read.json()).toEqual({ slug: "hello-world", count: 2 });
  });

  it("never passes the raw IP to storage", async () => {
    const { app, fake } = buildApp();
    await app.request("/v1/views/hello-world", { method: "POST", headers: client("203.0.113.7") });
    expect(JSON.stringify(fake.state.writes)).not.toContain("203.0.113.7");
  });

  it("rejects an invalid slug with validation_error", async () => {
    const res = await buildApp().app.request("/v1/views/Not_A_Slug");
    await expectError(res, 400, "validation_error");
  });
});

describe("reactions", () => {
  it("returns zero-filled counts", async () => {
    const res = await buildApp().app.request("/v1/reactions/hello-world");
    expect(reactionsResponseSchema.parse(await res.json()).counts).toEqual({
      fire: 0,
      brain: 0,
      rocket: 0,
    });
  });

  it("counts each type once per visitor", async () => {
    const { app } = buildApp();
    const path = "/v1/reactions/hello-world";
    await app.request(path, json({ type: "fire" }, client("1.1.1.1")));
    await app.request(path, json({ type: "fire" }, client("1.1.1.1")));
    await app.request(path, json({ type: "rocket" }, client("1.1.1.1")));
    const res = await app.request(path, json({ type: "fire" }, client("2.2.2.2")));
    expect(reactionsResponseSchema.parse(await res.json()).counts).toEqual({
      fire: 2,
      brain: 0,
      rocket: 1,
    });
  });

  it("rejects an unknown reaction type", async () => {
    const res = await buildApp().app.request(
      "/v1/reactions/hello-world",
      json({ type: "poop" }, client("1.1.1.1")),
    );
    await expectError(res, 400, "validation_error");
  });

  it("rejects malformed JSON with bad_request", async () => {
    const res = await buildApp().app.request("/v1/reactions/hello-world", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{nope",
    });
    await expectError(res, 400, "bad_request");
  });
});

describe("subscribe", () => {
  it("stores a normalized email and answers 202 pending", async () => {
    const { app, fake } = buildApp();
    const res = await app.request("/v1/subscribe", json({ email: "  Dev@Example.COM " }));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ status: "pending" });
    expect([...fake.state.subscribers.keys()]).toEqual(["dev@example.com"]);
  });

  it("answers identically for duplicates (no enumeration)", async () => {
    const { app } = buildApp();
    await app.request("/v1/subscribe", json({ email: "dev@example.com" }));
    const res = await app.request("/v1/subscribe", json({ email: "dev@example.com" }));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ status: "pending" });
  });

  it("silently drops honeypot submissions", async () => {
    const { app, fake } = buildApp();
    const res = await app.request(
      "/v1/subscribe",
      json({ email: "bot@example.com", website: "http://spam" }),
    );
    expect(res.status).toBe(202);
    expect(fake.state.subscribers.size).toBe(0);
  });

  it("rejects an invalid email", async () => {
    const res = await buildApp().app.request("/v1/subscribe", json({ email: "nope" }));
    const body = await expectError(res, 400, "validation_error");
    expect(body.error.message).toContain("email");
  });
});

describe("contact", () => {
  const valid = { name: "Ada", email: "ada@example.com", message: "Hello there, nice blog!" };

  it("stores the message and answers 202", async () => {
    const { app, fake } = buildApp();
    const res = await app.request("/v1/contact", json(valid));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ status: "received" });
    expect(fake.state.messages).toEqual([valid]);
  });

  it("rejects a too-short message", async () => {
    const res = await buildApp().app.request("/v1/contact", json({ ...valid, message: "hi" }));
    await expectError(res, 400, "validation_error");
  });

  it("rejects bodies over the size limit with 413", async () => {
    const res = await buildApp().app.request(
      "/v1/contact",
      json({ ...valid, message: "x".repeat(20_000) }),
    );
    await expectError(res, 413, "payload_too_large");
  });
});

describe("stats", () => {
  it("requires the admin key", async () => {
    const { app } = buildApp();
    await expectError(await app.request("/v1/stats"), 401, "unauthorized");
    await expectError(
      await app.request("/v1/stats", { headers: { "x-admin-api-key": "wrong" } }),
      401,
      "unauthorized",
    );
  });

  it("returns aggregate stats with a valid key", async () => {
    const { app } = buildApp();
    await app.request("/v1/views/a", { method: "POST", headers: client("1.1.1.1") });
    await app.request("/v1/views/b", { method: "POST", headers: client("1.1.1.1") });
    await app.request("/v1/views/b", { method: "POST", headers: client("2.2.2.2") });
    await app.request("/v1/reactions/a", json({ type: "brain" }, client("1.1.1.1")));
    await app.request("/v1/subscribe", json({ email: "x@example.com" }, client("3.3.3.3")));

    const res = await app.request("/v1/stats", { headers: { "x-admin-api-key": ADMIN_KEY } });
    expect(res.status).toBe(200);
    expect(statsResponseSchema.parse(await res.json())).toEqual({
      views: {
        total: 3,
        top: [
          { slug: "b", count: 2 },
          { slug: "a", count: 1 },
        ],
      },
      reactions: { fire: 0, brain: 1, rocket: 0 },
      subscribers: { total: 1, confirmed: 0 },
      contactMessages: 0,
    });
  });

  it("is disabled when no key is configured", async () => {
    const app = appWith({
      stats: createStatsService({ repository: createFakeStore().repos.stats }),
    });
    const res = await app.request("/v1/stats", { headers: { "x-admin-api-key": "" } });
    await expectError(res, 401, "unauthorized");
  });
});

describe("rate limiting", () => {
  it("returns 429 with Retry-After once the per-IP limit is exceeded", async () => {
    const { app } = buildApp({ rateLimits: { read: { limit: 2, windowMs: 60_000 } } });
    const hit = (ip: string) => app.request("/v1/views/a", { headers: client(ip) });

    expect((await hit("1.1.1.1")).headers.get("ratelimit-remaining")).toBe("1");
    expect((await hit("1.1.1.1")).status).toBe(200);
    const limited = await hit("1.1.1.1");
    await expectError(limited, 429, "rate_limited");
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);

    // Other clients keep their own budget.
    expect((await hit("2.2.2.2")).status).toBe(200);
  });

  it("keeps separate buckets per rule", async () => {
    const { app } = buildApp({ rateLimits: { inbox: { limit: 1, windowMs: 60_000 } } });
    await app.request("/v1/subscribe", json({ email: "a@example.com" }, client("1.1.1.1")));
    const limited = await app.request(
      "/v1/subscribe",
      json({ email: "b@example.com" }, client("1.1.1.1")),
    );
    expect(limited.status).toBe(429);
    expect((await app.request("/v1/views/a", { headers: client("1.1.1.1") })).status).toBe(200);
  });
});

describe("cross-cutting", () => {
  it("allows CORS only for WEB_ORIGIN", async () => {
    const { app } = buildApp();
    const preflight = (origin: string) =>
      app.request("/v1/reactions/a", {
        method: "OPTIONS",
        headers: {
          origin,
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type",
        },
      });
    expect((await preflight(WEB_ORIGIN)).headers.get("access-control-allow-origin")).toBe(
      WEB_ORIGIN,
    );
    expect(
      (await preflight("http://evil.test")).headers.get("access-control-allow-origin"),
    ).toBeNull();
  });

  it("propagates an incoming request id and generates one otherwise", async () => {
    const { app } = buildApp();
    const echoed = await app.request("/health", { headers: { "x-request-id": "abc-123" } });
    expect(echoed.headers.get("x-request-id")).toBe("abc-123");
    const generated = await app.request("/health");
    expect(generated.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("returns a typed 404 for unknown routes", async () => {
    const res = await buildApp().app.request("/nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { code: "not_found", message: "Route not found" } });
  });

  it("hides internal errors behind a generic 500", async () => {
    const fake = createFakeStore();
    const app = appWith({
      views: createViewsService({
        repository: {
          ...fake.repos.views,
          getCount: () => Promise.reject(new Error("db exploded: password=hunter2")),
        },
        hashVisitor: createVisitorHasher("s".repeat(32)),
      }),
    });
    const res = await app.request("/v1/views/a");
    const body = await expectError(res, 500, "internal");
    expect(body.error.message).not.toContain("hunter2");
  });
});
