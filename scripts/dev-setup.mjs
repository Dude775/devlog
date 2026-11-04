#!/usr/bin/env node
// One-time local setup: env file for the api, Postgres in Docker, migrations.
// Usage: pnpm dev:setup   (idempotent; safe to re-run)
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";

const apiEnv = "apps/api/.env";
const infraEnv = existsSync("infra/.env") ? "infra/.env" : "infra/.env.example";

function run(cmd, args) {
  console.info(`\n$ ${[cmd, ...args].join(" ")}`);
  const { status, error } = spawnSync(cmd, args, { stdio: "inherit" });
  if (error || status !== 0) {
    console.error(error?.message ?? `${cmd} exited with ${String(status)}`);
    process.exit(status ?? 1);
  }
}

if (existsSync(apiEnv)) {
  console.info(`${apiEnv} exists, leaving it untouched`);
} else {
  copyFileSync("apps/api/.env.example", apiEnv);
  console.info(`created ${apiEnv} from .env.example`);
}

// DATABASE_URL in apps/api/.env.example matches the credentials in infra/.env.example.
run("docker", [
  "compose",
  "-f",
  "infra/docker-compose.yml",
  "--env-file",
  infraEnv,
  "up",
  "-d",
  "--wait",
  "postgres",
]);
run("pnpm", ["--filter", "@devlog/api", "db:migrate"]);

console.info("\nReady. Run `pnpm dev` (web http://localhost:3000, api http://localhost:4000).");
