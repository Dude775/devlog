import { describe, expect, it } from "vitest";
import { createVisitorHasher, utcDay } from "./visitor-hash";

const input = { ip: "192.0.2.1", userAgent: "ua", day: "2026-11-04" };

describe("visitor hash", () => {
  it("is deterministic for the same salt and input", () => {
    const h = createVisitorHasher("s".repeat(32));
    expect(h(input)).toBe(h(input));
    expect(h(input)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes with the salt, the day, the ip and the user agent", () => {
    const h = createVisitorHasher("s".repeat(32));
    const base = h(input);
    expect(createVisitorHasher("t".repeat(32))(input)).not.toBe(base);
    expect(h({ ...input, day: "2026-11-05" })).not.toBe(base);
    expect(h({ ...input, ip: "192.0.2.2" })).not.toBe(base);
    expect(h({ ...input, userAgent: "other" })).not.toBe(base);
  });

  it("utcDay uses the UTC calendar date", () => {
    expect(utcDay(new Date("2026-11-04T23:30:00-05:00"))).toBe("2026-11-05");
  });
});
