import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { loadEnv } from "./config/env";
import { createDb } from "./db/client";
import { createClientIpResolver } from "./lib/client-ip";
import { createLogger } from "./lib/logger";
import { createMemoryRateLimitStore } from "./lib/rate-limit/memory-store";
import { APP_VERSION } from "./lib/version";
import { createVisitorHasher } from "./lib/visitor-hash";
import { createServices } from "./wiring";

const env = loadEnv();
const logger = createLogger({ level: env.LOG_LEVEL });
const { db, close: closeDb } = createDb(env.DATABASE_URL);
const rateLimitStore = createMemoryRateLimitStore();

const app = createApp({
  services: createServices({
    db,
    hashVisitor: createVisitorHasher(env.VIEW_HASH_SALT),
    version: APP_VERSION,
  }),
  logger,
  webOrigins: env.WEB_ORIGIN,
  adminApiKey: env.ADMIN_API_KEY,
  resolveClientIp: createClientIpResolver({ trustProxy: env.TRUST_PROXY }),
  rateLimitStore,
});

const server = serve({ fetch: app.fetch, port: env.PORT, hostname: env.HOST }, (info) => {
  logger.info(
    { version: APP_VERSION, address: info.address, port: info.port, origins: env.WEB_ORIGIN },
    "api listening",
  );
});

const SHUTDOWN_TIMEOUT_MS = 10_000;
let shuttingDown = false;

/** Stop accepting connections, drain in-flight requests, then release DB and limiter resources. */
function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "shutdown started");
  setTimeout(() => {
    logger.error("shutdown timed out, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  server.close((err) => {
    void Promise.allSettled([closeDb(), rateLimitStore.close()]).then(() => {
      if (err) logger.error({ err }, "server close failed");
      logger.info("shutdown complete");
      logger.flush();
      process.exit(err ? 1 : 0);
    });
  });
  // Keep-alive sockets would otherwise hold close() open until the timeout.
  if ("closeIdleConnections" in server) server.closeIdleConnections();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "unhandled rejection");
  shutdown("SIGTERM");
});
