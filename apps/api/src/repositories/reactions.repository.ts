import { type ReactionType } from "@devlog/shared/schemas";
import { eq, sql } from "drizzle-orm";
import { type Database } from "../db/client";
import { reactions, reactionVisitors } from "../db/schema";

export interface ReactionRow {
  type: ReactionType;
  count: number;
}

export interface ReactionsRepository {
  getCounts: (slug: string) => Promise<ReactionRow[]>;
  /** Returns true when the reaction was counted (first of this type by this visitor today). */
  addUnique: (input: {
    slug: string;
    type: ReactionType;
    visitorHash: string;
    day: string;
  }) => Promise<boolean>;
}

export function createReactionsRepository(db: Database): ReactionsRepository {
  return {
    getCounts(slug) {
      return db
        .select({ type: reactions.type, count: reactions.count })
        .from(reactions)
        .where(eq(reactions.slug, slug));
    },
    addUnique({ slug, type, visitorHash, day }) {
      return db.transaction(async (tx) => {
        const inserted = await tx
          .insert(reactionVisitors)
          .values({ slug, type, visitorHash, day })
          .onConflictDoNothing()
          .returning({ slug: reactionVisitors.slug });
        if (inserted.length === 0) return false;
        await tx
          .insert(reactions)
          .values({ slug, type, count: 1 })
          .onConflictDoUpdate({
            target: [reactions.slug, reactions.type],
            set: { count: sql`${reactions.count} + 1` },
          });
        return true;
      });
    },
  };
}
