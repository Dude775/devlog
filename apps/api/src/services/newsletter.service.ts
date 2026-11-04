import { type SubscribeResponse, type subscribeRequestSchema } from "@devlog/shared/schemas";
import { type z } from "zod";
import { type SubscribersRepository } from "../repositories/subscribers.repository";

export type SubscribeInput = z.output<typeof subscribeRequestSchema>;
export type SubscribeOutcome = "created" | "duplicate" | "spam";

export interface NewsletterService {
  /** Always resolves `{ status: "pending" }` to the caller; `outcome` is for logs only. */
  subscribe: (input: SubscribeInput) => Promise<SubscribeResponse & { outcome: SubscribeOutcome }>;
}

export function createNewsletterService({
  repository,
}: {
  repository: SubscribersRepository;
}): NewsletterService {
  return {
    async subscribe({ email, website }) {
      if (website) return { status: "pending", outcome: "spam" };
      const created = await repository.add(email);
      return { status: "pending", outcome: created ? "created" : "duplicate" };
    },
  };
}
