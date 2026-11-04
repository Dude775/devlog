import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { type Database } from "./client";

/** `drizzle/` sits at the package root: one level above both src/db (tsx) and dist (bundle). */
export function migrationsFolder(fromUrl: string = import.meta.url): string {
  const depth = fromUrl.includes("/dist/") ? "../drizzle" : "../../drizzle";
  return fileURLToPath(new URL(depth, fromUrl));
}

export function runMigrations(db: Database): Promise<void> {
  return migrate(db, { migrationsFolder: migrationsFolder() });
}
