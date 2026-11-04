import { type Database } from "../db/client";
import { subscribers } from "../db/schema";

export interface SubscribersRepository {
  /** Idempotent: returns false when the email already exists. */
  add: (email: string) => Promise<boolean>;
}

export function createSubscribersRepository(db: Database): SubscribersRepository {
  return {
    async add(email) {
      const rows = await db
        .insert(subscribers)
        .values({ email })
        .onConflictDoNothing({ target: subscribers.email })
        .returning({ id: subscribers.id });
      return rows.length > 0;
    },
  };
}
