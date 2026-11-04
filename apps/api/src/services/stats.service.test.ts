import { describe, expect, it } from "vitest";
import { createStatsService } from "./stats.service";

describe("stats service", () => {
  it("shapes the repository snapshot into the shared contract", async () => {
    const calls: number[] = [];
    const service = createStatsService({
      topN: 3,
      repository: {
        snapshot: ({ topN }) => {
          calls.push(topN);
          return Promise.resolve({
            totalViews: 10,
            topPosts: [{ slug: "a", count: 10 }],
            reactionTotals: [{ type: "fire", count: 2 }],
            subscribers: { total: 4, confirmed: 1 },
            contactMessages: 5,
          });
        },
      },
    });
    await expect(service.get()).resolves.toEqual({
      views: { total: 10, top: [{ slug: "a", count: 10 }] },
      reactions: { fire: 2, brain: 0, rocket: 0 },
      subscribers: { total: 4, confirmed: 1 },
      contactMessages: 5,
    });
    expect(calls).toEqual([3]);
  });
});
