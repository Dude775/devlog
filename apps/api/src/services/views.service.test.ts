import { describe, expect, it } from "vitest";
import { createVisitorHasher } from "../lib/visitor-hash";
import { createFakeStore } from "../testing/fakes";
import { createViewsService } from "./views.service";

const visitor = { ip: "198.51.100.4", userAgent: "Mozilla/5.0" };

function setup(start = "2026-11-04T10:00:00Z") {
  let now = new Date(start);
  const fake = createFakeStore();
  const service = createViewsService({
    repository: fake.repos.views,
    hashVisitor: createVisitorHasher("x".repeat(32)),
    now: () => now,
  });
  return {
    service,
    fake,
    setNow: (iso: string) => {
      now = new Date(iso);
    },
  };
}

describe("views service", () => {
  it("returns 0 for an unseen post", async () => {
    await expect(setup().service.get("new-post")).resolves.toEqual({ slug: "new-post", count: 0 });
  });

  it("dedupes the same visitor within a UTC day", async () => {
    const { service, setNow } = setup();
    await service.record("p", visitor);
    setNow("2026-11-04T23:59:59Z");
    await expect(service.record("p", visitor)).resolves.toEqual({ slug: "p", count: 1 });
  });

  it("counts the same visitor again on the next UTC day", async () => {
    const { service, setNow } = setup();
    await service.record("p", visitor);
    setNow("2026-11-05T00:00:01Z");
    await expect(service.record("p", visitor)).resolves.toEqual({ slug: "p", count: 2 });
  });

  it("treats a different user agent as a different visitor", async () => {
    const { service } = setup();
    await service.record("p", visitor);
    await expect(service.record("p", { ...visitor, userAgent: "curl/8" })).resolves.toMatchObject({
      count: 2,
    });
  });

  it("hands storage a 64-char hex hash and the day, never the IP or UA", async () => {
    const { service, fake } = setup();
    await service.record("p", visitor);
    expect(fake.state.writes).toHaveLength(1);
    expect(fake.state.writes[0]).toMatchObject({ slug: "p", day: "2026-11-04" });
    const { visitorHash } = fake.state.writes[0] as { visitorHash: string };
    expect(visitorHash).toMatch(/^[0-9a-f]{64}$/);
    const serialized = JSON.stringify(fake.state.writes);
    expect(serialized).not.toContain(visitor.ip);
    expect(serialized).not.toContain(visitor.userAgent);
  });
});
