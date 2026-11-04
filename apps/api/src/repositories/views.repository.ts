import { eq, sql } from "drizzle-orm";
import { type Database } from "../db/client";
import { postViews, postViewVisitors } from "../db/schema";

export interface ViewsRepository {
  getCount: (slug: string) => Promise<number>;
  /** Inserts the visitor into the dedup ledger; increments only on first sight. Returns the count. */
  recordUnique: (input: { slug: string; visitorHash: string; day: string }) => Promise<number>;
}

export function createViewsRepository(db: Database): ViewsRepository {
  return {
    async getCount(slug) {
      const [row] = await db
        .select({ count: postViews.count })
        .from(postViews)
        .where(eq(postViews.slug, slug));
      return row?.count ?? 0;
    },
    recordUnique({ slug, visitorHash, day }) {
      return db.transaction(async (tx) => {
        const inserted = await tx
          .insert(postViewVisitors)
          .values({ slug, visitorHash, day })
          .onConflictDoNothing()
          .returning({ slug: postViewVisitors.slug });

        if (inserted.length > 0) {
          const [row] = await tx
            .insert(postViews)
            .values({ slug, count: 1 })
            .onConflictDoUpdate({
              target: postViews.slug,
              set: { count: sql`${postViews.count} + 1`, updatedAt: sql`now()` },
            })
            .returning({ count: postViews.count });
          return row?.count ?? 1;
        }

        const [row] = await tx
          .select({ count: postViews.count })
          .from(postViews)
          .where(eq(postViews.slug, slug));
        return row?.count ?? 0;
      });
    },
  };
}
