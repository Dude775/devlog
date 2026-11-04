import { loadEnv } from "./config/env";
import { createDb } from "./db/client";
import { migrationsFolder, runMigrations } from "./db/migrations";
import { createLogger } from "./lib/logger";

/** One-shot migration job: compose `migrate` service and `pnpm db:migrate`. */
const env = loadEnv();
const logger = createLogger({ level: env.LOG_LEVEL });
const { db, close } = createDb(env.DATABASE_URL);

try {
  logger.info({ migrationsFolder: migrationsFolder() }, "applying migrations");
  await runMigrations(db);
  logger.info("migrations applied");
} catch (err) {
  logger.fatal({ err }, "migration failed");
  process.exitCode = 1;
} finally {
  await close();
}
