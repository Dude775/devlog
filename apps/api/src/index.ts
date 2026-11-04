import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { loadEnv } from "./config/env";
import { createDb } from "./db/client";
import { APP_VERSION } from "./lib/version";
import { createHealthRepository } from "./repositories/health.repository";
import { createHealthService } from "./services/health.service";

const env = loadEnv();
const { db, close } = createDb(env.DATABASE_URL);

const app = createApp({
  services: {
    health: createHealthService({ repository: createHealthRepository(db), version: APP_VERSION }),
  },
  corsOrigins: env.CORS_ORIGINS,
  enableLogger: env.NODE_ENV !== "test",
});

const server = serve({ fetch: app.fetch, port: env.PORT, hostname: env.HOST }, (info) => {
  console.info(`api v${APP_VERSION} listening on http://${info.address}:${info.port}`);
});

function shutdown(signal: string) {
  console.info(`${signal} received, shutting down`);
  server.close(() => {
    void close().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});
process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});
