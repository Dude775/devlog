import {
  reactionTypes,
  type ReactionCounts,
  type ReactionsResponse,
  type ReactionType,
} from "@devlog/shared/schemas";
import { type VisitorHasher, utcDay } from "../lib/visitor-hash";
import { type ReactionRow, type ReactionsRepository } from "../repositories/reactions.repository";
import { type Visitor } from "./visitor";

export interface ReactionsService {
  get: (slug: string) => Promise<ReactionsResponse>;
  add: (slug: string, type: ReactionType, visitor: Visitor) => Promise<ReactionsResponse>;
}

export interface ReactionsServiceDeps {
  repository: ReactionsRepository;
  hashVisitor: VisitorHasher;
  now?: () => Date;
}

/** Zero-fills missing types so clients always get every key. */
export function toReactionCounts(rows: ReactionRow[]): ReactionCounts {
  const counts = Object.fromEntries(reactionTypes.map((t) => [t, 0])) as ReactionCounts;
  for (const { type, count } of rows) counts[type] += count;
  return counts;
}

export function createReactionsService({
  repository,
  hashVisitor,
  now = () => new Date(),
}: ReactionsServiceDeps): ReactionsService {
  const get = async (slug: string): Promise<ReactionsResponse> => ({
    slug,
    counts: toReactionCounts(await repository.getCounts(slug)),
  });
  return {
    get,
    async add(slug, type, visitor) {
      const day = utcDay(now());
      // Ledger key is (slug, type, hash): each reaction type counts once per visitor per day.
      await repository.addUnique({
        slug,
        type,
        day,
        visitorHash: hashVisitor({ ...visitor, day }),
      });
      return get(slug);
    },
  };
}
