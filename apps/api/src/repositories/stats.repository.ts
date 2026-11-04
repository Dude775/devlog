import { count, desc, sql } from "drizzle-orm";
import { type Database } from "../db/client";
import { contactMessages, postViews, reactions, subscribers } from "../db/schema";
import { type ReactionRow } from "./reactions.repository";

export interface StatsSnapshot {
  totalViews: number;
  topPosts: { slug: string; count: number }[];
  reactionTotals: ReactionRow[];
  subscribers: { total: number; confirmed: number };
  contactMessages: number;
}

export interface StatsRepository {
  snapshot: (input: { topN: number }) => Promise<StatsSnapshot>;
}

export function createStatsRepository(db: Database): StatsRepository {
  return {
    async snapshot({ topN }) {
      const [views, topPosts, reactionTotals, subs, messages] = await Promise.all([
        db
          .select({ total: sql<number>`coalesce(sum(${postViews.count}), 0)::int` })
          .from(postViews),
        db
          .select({ slug: postViews.slug, count: postViews.count })
          .from(postViews)
          .orderBy(desc(postViews.count), postViews.slug)
          .limit(topN),
        db
          .select({ type: reactions.type, count: sql<number>`sum(${reactions.count})::int` })
          .from(reactions)
          .groupBy(reactions.type),
        db
          .select({
            total: count(),
            confirmed: sql<number>`count(*) filter (where ${subscribers.confirmed})::int`,
          })
          .from(subscribers),
        db.select({ total: count() }).from(contactMessages),
      ]);
      return {
        totalViews: views[0]?.total ?? 0,
        topPosts,
        reactionTotals,
        subscribers: { total: subs[0]?.total ?? 0, confirmed: subs[0]?.confirmed ?? 0 },
        contactMessages: messages[0]?.total ?? 0,
      };
    },
  };
}
