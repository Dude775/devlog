import { sql } from "drizzle-orm";
import { type Database } from "../db/client";

export interface HealthRepository {
  pingDatabase: () => Promise<boolean>;
}

export function createHealthRepository(db: Database): HealthRepository {
  return {
    async pingDatabase() {
      try {
        await db.execute(sql`select 1`);
        return true;
      } catch {
        return false;
      }
    },
  };
}
