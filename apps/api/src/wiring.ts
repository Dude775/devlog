import { type Database } from "./db/client";
import { type Services } from "./app";
import { type VisitorHasher } from "./lib/visitor-hash";
import { createContactRepository } from "./repositories/contact.repository";
import { createHealthRepository } from "./repositories/health.repository";
import { createReactionsRepository } from "./repositories/reactions.repository";
import { createStatsRepository } from "./repositories/stats.repository";
import { createSubscribersRepository } from "./repositories/subscribers.repository";
import { createViewsRepository } from "./repositories/views.repository";
import { createContactService } from "./services/contact.service";
import { createHealthService } from "./services/health.service";
import { createNewsletterService } from "./services/newsletter.service";
import { createReactionsService } from "./services/reactions.service";
import { createStatsService } from "./services/stats.service";
import { createViewsService } from "./services/views.service";

/** Wires repositories -> services against a real database. */
export function createServices({
  db,
  hashVisitor,
  version,
}: {
  db: Database;
  hashVisitor: VisitorHasher;
  version: string;
}): Services {
  return {
    health: createHealthService({ repository: createHealthRepository(db), version }),
    views: createViewsService({ repository: createViewsRepository(db), hashVisitor }),
    reactions: createReactionsService({ repository: createReactionsRepository(db), hashVisitor }),
    newsletter: createNewsletterService({ repository: createSubscribersRepository(db) }),
    contact: createContactService({ repository: createContactRepository(db) }),
    stats: createStatsService({ repository: createStatsRepository(db) }),
  };
}
