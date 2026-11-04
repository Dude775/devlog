import { type ReactionType } from "@devlog/shared/schemas";
import { type ContactRepository } from "../repositories/contact.repository";
import { type ReactionRow, type ReactionsRepository } from "../repositories/reactions.repository";
import { type StatsRepository } from "../repositories/stats.repository";
import { type SubscribersRepository } from "../repositories/subscribers.repository";
import { type ViewsRepository } from "../repositories/views.repository";

/** In-memory repositories with the same dedup semantics as the Postgres ones. */
export function createFakeStore() {
  const views = new Map<string, number>();
  const viewLedger = new Set<string>();
  const reactions = new Map<string, number>();
  const reactionLedger = new Set<string>();
  const subscribers = new Map<string, { confirmed: boolean }>();
  const messages: { name: string; email: string; message: string }[] = [];
  /** Every argument a repository received; lets tests assert no raw IP reaches storage. */
  const writes: unknown[] = [];

  const viewsRepo: ViewsRepository = {
    getCount: (slug) => Promise.resolve(views.get(slug) ?? 0),
    recordUnique(input) {
      writes.push(input);
      const key = `${input.slug}|${input.visitorHash}`;
      if (!viewLedger.has(key)) {
        viewLedger.add(key);
        views.set(input.slug, (views.get(input.slug) ?? 0) + 1);
      }
      return Promise.resolve(views.get(input.slug) ?? 0);
    },
  };

  const reactionsRepo: ReactionsRepository = {
    getCounts(slug) {
      const rows: ReactionRow[] = [];
      for (const [key, count] of reactions) {
        const [s, type] = key.split("|") as [string, ReactionType];
        if (s === slug) rows.push({ type, count });
      }
      return Promise.resolve(rows);
    },
    addUnique(input) {
      writes.push(input);
      const key = `${input.slug}|${input.type}|${input.visitorHash}`;
      if (reactionLedger.has(key)) return Promise.resolve(false);
      reactionLedger.add(key);
      const countKey = `${input.slug}|${input.type}`;
      reactions.set(countKey, (reactions.get(countKey) ?? 0) + 1);
      return Promise.resolve(true);
    },
  };

  const subscribersRepo: SubscribersRepository = {
    add(email) {
      writes.push({ email });
      if (subscribers.has(email)) return Promise.resolve(false);
      subscribers.set(email, { confirmed: false });
      return Promise.resolve(true);
    },
  };

  const contactRepo: ContactRepository = {
    create(input) {
      writes.push(input);
      messages.push(input);
      return Promise.resolve();
    },
  };

  const statsRepo: StatsRepository = {
    snapshot({ topN }) {
      const totals = new Map<ReactionType, number>();
      for (const [key, count] of reactions) {
        const type = key.split("|")[1] as ReactionType;
        totals.set(type, (totals.get(type) ?? 0) + count);
      }
      const subs = [...subscribers.values()];
      return Promise.resolve({
        totalViews: [...views.values()].reduce((a, b) => a + b, 0),
        topPosts: [...views.entries()]
          .map(([slug, count]) => ({ slug, count }))
          .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))
          .slice(0, topN),
        reactionTotals: [...totals.entries()].map(([type, count]) => ({ type, count })),
        subscribers: { total: subs.length, confirmed: subs.filter((s) => s.confirmed).length },
        contactMessages: messages.length,
      });
    },
  };

  return {
    repos: {
      views: viewsRepo,
      reactions: reactionsRepo,
      subscribers: subscribersRepo,
      contact: contactRepo,
      stats: statsRepo,
    },
    state: { views, subscribers, messages, writes },
  };
}
