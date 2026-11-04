import { describe, expect, it } from "vitest";
import { loadEnv } from "./env";

const base = { DATABASE_URL: "postgres://u:p@localhost:5432/db" };

describe("loadEnv", () => {
  it("applies defaults and parses WEB_ORIGIN as a list", () => {
    const env = loadEnv({ ...base, WEB_ORIGIN: "http://a.test, http://b.test" });
    expect(env.WEB_ORIGIN).toEqual(["http://a.test", "http://b.test"]);
    expect(env.TRUST_PROXY).toBe(false);
    expect(env.ADMIN_API_KEY).toBeUndefined();
  });

  it("treats empty secrets as unset", () => {
    expect(loadEnv({ ...base, ADMIN_API_KEY: "" }).ADMIN_API_KEY).toBeUndefined();
  });

  it("rejects short secrets", () => {
    expect(() => loadEnv({ ...base, ADMIN_API_KEY: "short" })).toThrow(/ADMIN_API_KEY/);
  });

  it("requires VIEW_HASH_SALT in production", () => {
    expect(() => loadEnv({ ...base, NODE_ENV: "production" })).toThrow(/VIEW_HASH_SALT/);
    const salt = "s".repeat(32);
    expect(loadEnv({ ...base, NODE_ENV: "production", VIEW_HASH_SALT: salt }).VIEW_HASH_SALT).toBe(
      salt,
    );
  });
});
