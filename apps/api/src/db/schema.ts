import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Per-post view counter. First real table; extended in Phase 3. */
export const postViews = pgTable("post_views", {
  slug: text("slug").primaryKey(),
  views: integer("views").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
