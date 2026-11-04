import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { reactionTypes } from "@devlog/shared/schemas";

/** Aggregated unique views per post. */
export const postViews = pgTable("post_views", {
  slug: text("slug").primaryKey(),
  count: integer("count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Dedup ledger for unique views. `visitor_hash` = sha256(salt, ip, ua, day); the raw IP is never
 * stored. `day` exists only so old rows can be pruned (`delete ... where day < now() - 2 days`).
 */
export const postViewVisitors = pgTable(
  "post_view_visitors",
  {
    slug: text("slug").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    day: date("day").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.slug, t.visitorHash] }),
    index("post_view_visitors_day_idx").on(t.day),
  ],
);

export const reactionType = pgEnum("reaction_type", reactionTypes);

export const reactions = pgTable(
  "reactions",
  {
    slug: text("slug").notNull(),
    type: reactionType("type").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.slug, t.type] })],
);

/** Same hashed-visitor dedup for reactions: one reaction of each type per visitor per day. */
export const reactionVisitors = pgTable(
  "reaction_visitors",
  {
    slug: text("slug").notNull(),
    type: reactionType("type").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    day: date("day").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.slug, t.type, t.visitorHash] }),
    index("reaction_visitors_day_idx").on(t.day),
  ],
);

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  confirmed: boolean("confirmed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
