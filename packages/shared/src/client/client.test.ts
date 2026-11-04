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
