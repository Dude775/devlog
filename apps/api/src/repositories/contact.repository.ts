import { type Database } from "../db/client";
import { contactMessages } from "../db/schema";

export interface ContactRepository {
  create: (input: { name: string; email: string; message: string }) => Promise<void>;
}

export function createContactRepository(db: Database): ContactRepository {
  return {
    async create(input) {
      await db.insert(contactMessages).values(input);
    },
  };
}
