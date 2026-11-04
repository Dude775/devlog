import { type ApiError } from "@devlog/shared/schemas";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { healthRoutes } from "./routes/health.routes";
import { type HealthService } from "./services/health.service";

export interface AppDeps {
  services: { health: HealthService };
  corsOrigins: string[];
  enableLogger?: boolean;
}

/** Composition root for HTTP. Pure: no env reads, no side effects; trivially testable. */
export function createApp({ services, corsOrigins, enableLogger = true }: AppDeps) {
  const app = new Hono();

  app.use("*", requestId());
  if (enableLogger) app.use("*", logger());
  app.use("*", secureHeaders());
  app.use("*", cors({ origin: corsOrigins }));

  app.route("/health", healthRoutes(services.health));

  app.notFound((c) =>
    c.json<ApiError>({ error: { code: "not_found", message: "Route not found" } }, 404),
  );
  app.onError((err, c) => {
    console.error(err);
    return c.json<ApiError>({ error: { code: "internal", message: "Internal server error" } }, 500);
  });

  return app;
}

export type App = ReturnType<typeof createApp>;
