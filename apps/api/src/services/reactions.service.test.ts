import { describe, expect, it } from "vitest";
import { createVisitorHasher } from "../lib/visitor-hash";
import { createFakeStore } from "../testing/fakes";
import { createReactionsService, toReactionCounts } from "./reactions.service";

const visitor = { ip: "198.51.100.4", userAgent: "ua" };

function setup() {
  const fake = createFakeStore();
  const service = createReactionsService({
    repository: fake.repos.reactions,
    hashVisitor: createVisitorHasher("x".repeat(32)),
    now: () => new Date("2026-11-04T12:00:00Z"),
  });
  return { service, fake };
}

describe("toReactionCounts", () => {
  it("zero-fills missing types", () => {
    expect(toReactionCounts([{ type: "rocket", count: 3 }])).toEqual({
      fire: 0,
      brain: 0,
      rocket: 3,
    });
  });
});

describe("reactions service", () => {
  it("counts each type at most once per visitor per day", async () => {
    const { service } = setup();
    await service.add("p", "fire", visitor);
    await service.add("p", "fire", visitor);
    const result = await service.add("p", "brain", visitor);
    expect(result).toEqual({ slug: "p", counts: { fire: 1, brain: 1, rocket: 0 } });
  });

  it("isolates counts per slug", async () => {
    const { service } = setup();
    await service.add("a", "fire", visitor);
    await expect(service.get("b")).resolves.toEqual({
      slug: "b",
      counts: { fire: 0, brain: 0, rocket: 0 },
    });
  });

  it("never passes the raw IP to storage", async () => {
    const { service, fake } = setup();
    await service.add("p", "rocket", visitor);
    expect(JSON.stringify(fake.state.writes)).not.toContain(visitor.ip);
  });
});
