import { type PostViewsResponse } from "@devlog/shared/schemas";
import { type VisitorHasher, utcDay } from "../lib/visitor-hash";
import { type ViewsRepository } from "../repositories/views.repository";
import { type Visitor } from "./visitor";

export interface ViewsService {
  get: (slug: string) => Promise<PostViewsResponse>;
  record: (slug: string, visitor: Visitor) => Promise<PostViewsResponse>;
}

export interface ViewsServiceDeps {
  repository: ViewsRepository;
  hashVisitor: VisitorHasher;
  now?: () => Date;
}

export function createViewsService({
  repository,
  hashVisitor,
  now = () => new Date(),
}: ViewsServiceDeps): ViewsService {
  return {
    async get(slug) {
      return { slug, count: await repository.getCount(slug) };
    },
    async record(slug, visitor) {
      const day = utcDay(now());
      const visitorHash = hashVisitor({ ...visitor, day });
      return { slug, count: await repository.recordUnique({ slug, visitorHash, day }) };
    },
  };
}
