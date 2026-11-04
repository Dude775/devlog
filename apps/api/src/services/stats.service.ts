import { type StatsResponse } from "@devlog/shared/schemas";
import { type StatsRepository } from "../repositories/stats.repository";
import { toReactionCounts } from "./reactions.service";

export interface StatsService {
  get: () => Promise<StatsResponse>;
}

export function createStatsService({
  repository,
  topN = 10,
}: {
  repository: StatsRepository;
  topN?: number;
}): StatsService {
  return {
    async get() {
      const s = await repository.snapshot({ topN });
      return {
        views: { total: s.totalViews, top: s.topPosts },
        reactions: toReactionCounts(s.reactionTotals),
        subscribers: s.subscribers,
        contactMessages: s.contactMessages,
      };
    },
  };
}
