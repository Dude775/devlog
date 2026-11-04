import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

export interface DbHandle {
  db: Database;
  close: () => Promise<void>;
}

export function createDb(databaseUrl: string): DbHandle {
  // Lazy: postgres-js connects on first query, so boot does not require a live DB.
  const sql = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 5,
    onnotice: () => undefined,
  });
  return {
    db: drizzle(sql, { schema }),
    close: () => sql.end({ timeout: 5 }),
  };
}
