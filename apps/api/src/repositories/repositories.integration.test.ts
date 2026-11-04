import { sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { testDatabaseUrl } from "../config/env";
import { createDb, type DbHandle } from "../db/client";
import { runMigrations } from "../db/migrations";
import { createContactRepository } from "./contact.repository";
import { createReactionsRepository } from "./reactions.repository";
import { createStatsRepository } from "./stats.repository";
import { createSubscribersRepository } from "./subscribers.repository";
import { createViewsRepository } from "./views.repository";

const url = testDatabaseUrl();

/**
 * Runs the real SQL (migrations, upserts, ON CONFLICT dedup, aggregates) against Postgres.
 * Enabled by TEST_DATABASE_URL; CI sets it via a postgres service container.
 */
describe.skipIf(!url)("repositories (postgres)", () => {
  let handle: DbHandle;

  beforeAll(async () => {
    handle = createDb(url ?? "");
    await runMigrations(handle.db);
  });
  afterAll(async () => {
    await handle.close();
  });
  beforeEach(async () => {
    await handle.db.execute(
      sql`truncate post_views, post_view_visitors, reactions, reaction_visitors, subscribers, contact_messages restart identity`,
    );
  });

  it("migrations are idempotent", async () => {
    await expect(runMigrations(handle.db)).resolves.toBeUndefined();
  });

  it("views: dedupes by (slug, visitor hash) and counts concurrently without lost updates", async () => {
    const repo = createViewsRepository(handle.db);
    const day = "2026-11-04";
    expect(await repo.getCount("p")).toBe(0);
    expect(await repo.recordUnique({ slug: "p", visitorHash: "h1", day })).toBe(1);
    expect(await repo.recordUnique({ slug: "p", visitorHash: "h1", day })).toBe(1);
    await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        repo.recordUnique({ slug: "p", visitorHash: `c${i}`, day }),
      ),
    );
    expect(await repo.getCount("p")).toBe(21);
  });

  it("reactions: one per type per visitor", async () => {
    const repo = createReactionsRepository(handle.db);
    const base = { slug: "p", visitorHash: "h", day: "2026-11-04" };
    expect(await repo.addUnique({ ...base, type: "fire" })).toBe(true);
    expect(await repo.addUnique({ ...base, type: "fire" })).toBe(false);
    expect(await repo.addUnique({ ...base, type: "rocket" })).toBe(true);
    const rows = await repo.getCounts("p");
    expect(rows.sort((a, b) => a.type.localeCompare(b.type))).toEqual([
      { type: "fire", count: 1 },
      { type: "rocket", count: 1 },
    ]);
  });

  it("subscribers: email is unique", async () => {
    const repo = createSubscribersRepository(handle.db);
    expect(await repo.add("a@example.com")).toBe(true);
    expect(await repo.add("a@example.com")).toBe(false);
  });

  it("stats: aggregates across tables", async () => {
    const day = "2026-11-04";
    const views = createViewsRepository(handle.db);
    await views.recordUnique({ slug: "a", visitorHash: "1", day });
    await views.recordUnique({ slug: "b", visitorHash: "1", day });
    await views.recordUnique({ slug: "b", visitorHash: "2", day });
    await createReactionsRepository(handle.db).addUnique({
      slug: "a",
      type: "brain",
      visitorHash: "1",
      day,
    });
    await createSubscribersRepository(handle.db).add("x@example.com");
    await createContactRepository(handle.db).create({
      name: "n",
      email: "e@example.com",
      message: "hello world",
    });

    await expect(createStatsRepository(handle.db).snapshot({ topN: 5 })).resolves.toEqual({
      totalViews: 3,
      topPosts: [
        { slug: "b", count: 2 },
        { slug: "a", count: 1 },
      ],
      reactionTotals: [{ type: "brain", count: 1 }],
      subscribers: { total: 1, confirmed: 0 },
      contactMessages: 1,
    });
  });
});
