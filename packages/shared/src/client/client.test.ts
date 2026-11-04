import { describe, expect, it } from "vitest";
import { ApiClientError, createApiClient } from "./index";

function mockFetch(status: number, body: unknown): typeof fetch {
  return () => Promise.resolve(new Response(JSON.stringify(body), { status }));
}

describe("createApiClient", () => {
  it("parses a valid health response", async () => {
    const client = createApiClient({
      baseUrl: "http://api.test/",
      fetch: mockFetch(200, { status: "ok", version: "0.1.0", uptime: 12.5 }),
    });
    await expect(client.health()).resolves.toEqual({
      status: "ok",
      version: "0.1.0",
      uptime: 12.5,
    });
  });

  it("rejects a response that violates the schema", async () => {
    const client = createApiClient({
      baseUrl: "http://api.test",
      fetch: mockFetch(200, { status: "nope" }),
    });
    await expect(client.health()).rejects.toThrow();
  });

  it("throws ApiClientError on non-2xx", async () => {
    const client = createApiClient({ baseUrl: "http://api.test", fetch: mockFetch(500, {}) });
    await expect(client.health()).rejects.toBeInstanceOf(ApiClientError);
  });
});

describe("engagement + inbox methods", () => {
  function recordingFetch(status: number, body: unknown) {
    const calls: { url: string; init: RequestInit | undefined }[] = [];
    const fetchFn: typeof fetch = (input, init) => {
      calls.push({ url: input as string, init });
      return Promise.resolve(new Response(JSON.stringify(body), { status }));
    };
    return { calls, fetchFn };
  }

  it("POSTs a view and parses the count", async () => {
    const { calls, fetchFn } = recordingFetch(200, { slug: "hello-world", count: 7 });
    const client = createApiClient({ baseUrl: "http://api.test", fetch: fetchFn });
    await expect(client.views.record("hello-world")).resolves.toEqual({
      slug: "hello-world",
      count: 7,
    });
    expect(calls[0]?.url).toBe("http://api.test/v1/views/hello-world");
    expect(calls[0]?.init?.method).toBe("POST");
  });

  it("sends a JSON body for reactions", async () => {
    const { calls, fetchFn } = recordingFetch(200, {
      slug: "a",
      counts: { fire: 1, brain: 0, rocket: 0 },
    });
    const client = createApiClient({ baseUrl: "http://api.test", fetch: fetchFn });
    await client.reactions.add("a", "fire");
    expect(calls[0]?.init?.body).toBe(JSON.stringify({ type: "fire" }));
    expect(new Headers(calls[0]?.init?.headers).get("content-type")).toBe("application/json");
  });

  it("surfaces the API error code and message", async () => {
    const { fetchFn } = recordingFetch(429, {
      error: { code: "rate_limited", message: "Too many requests" },
    });
    const client = createApiClient({ baseUrl: "http://api.test", fetch: fetchFn });
    const err = await client.subscribe({ email: "a@b.co" }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiClientError);
    expect(err).toMatchObject({ status: 429, code: "rate_limited", message: "Too many requests" });
  });

  it("passes the admin key header for stats", async () => {
    const { calls, fetchFn } = recordingFetch(200, {
      views: { total: 0, top: [] },
      reactions: { fire: 0, brain: 0, rocket: 0 },
      subscribers: { total: 0, confirmed: 0 },
      contactMessages: 0,
    });
    const client = createApiClient({ baseUrl: "http://api.test", fetch: fetchFn });
    await client.stats("secret");
    expect(new Headers(calls[0]?.init?.headers).get("x-admin-api-key")).toBe("secret");
  });

  it("accepts a 503 readiness body", async () => {
    const { fetchFn } = recordingFetch(503, {
      status: "not_ready",
      checks: { database: "down" },
    });
    const client = createApiClient({ baseUrl: "http://api.test", fetch: fetchFn });
    await expect(client.ready()).resolves.toMatchObject({ status: "not_ready" });
  });
});
