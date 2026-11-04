import { type ApiError } from "@devlog/shared/schemas";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { type Logger } from "pino";
import { type ClientIpResolver } from "./lib/client-ip";
import { errorBody, HttpError } from "./lib/http-error";
import { type RateLimitStore } from "./lib/rate-limit/store";
import { type AppEnv } from "./lib/types";
import { adminAuth } from "./middleware/admin-auth";
import { clientIp } from "./middleware/client-ip";
import { rateLimit, type RateLimitRule } from "./middleware/rate-limit";
import { requestLogger } from "./middleware/request-logger";
import { contactRoutes } from "./routes/contact.routes";
import { healthRoutes } from "./routes/health.routes";
import { reactionsRoutes } from "./routes/reactions.routes";
import { statsRoutes } from "./routes/stats.routes";
import { subscribeRoutes } from "./routes/subscribe.routes";
import { viewsRoutes } from "./routes/views.routes";
import { type ContactService } from "./services/contact.service";
import { type HealthService } from "./services/health.service";
import { type NewsletterService } from "./services/newsletter.service";
import { type ReactionsService } from "./services/reactions.service";
import { type StatsService } from "./services/stats.service";
import { type ViewsService } from "./services/views.service";

export interface Services {
  health: HealthService;
  views: ViewsService;
  reactions: ReactionsService;
  newsletter: NewsletterService;
  contact: ContactService;
  stats: StatsService;
}

export interface RateLimitRules {
  /** GET counters. */
  read: RateLimitRule;
  /** POST views/reactions. */
  engage: RateLimitRule;
  /** POST subscribe/contact (writes a row with user content). */
  inbox: RateLimitRule;
  /** Admin endpoints (also throttles key brute-forcing). */
  admin: RateLimitRule;
}

export const defaultRateLimits: RateLimitRules = {
  read: { limit: 120, windowMs: 60_000 },
  engage: { limit: 30, windowMs: 60_000 },
  inbox: { limit: 5, windowMs: 15 * 60_000 },
  admin: { limit: 20, windowMs: 60_000 },
};

export interface AppDeps {
  services: Services;
  logger: Logger;
  /** CORS allow-list (WEB_ORIGIN). */
  webOrigins: string[];
  adminApiKey?: string | undefined;
  resolveClientIp: ClientIpResolver;
  rateLimitStore: RateLimitStore;
  rateLimits?: Partial<RateLimitRules>;
}

const MAX_BODY_BYTES = 16 * 1024;

/**
 * helmet-equivalent defaults for a JSON-only API: nothing may render, frame or script it.
 * CORP stays `same-origin`; the web reads the API via CORS fetch, which CORP does not block.
 */
const apiSecurityHeaders = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'none'"],
    formAction: ["'none'"],
  },
  strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
  referrerPolicy: "no-referrer",
  xFrameOptions: "DENY",
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
  },
});

/** Composition root for HTTP. Pure: no env reads, no side effects; trivially testable. */
export function createApp({
  services,
  logger,
  webOrigins,
  adminApiKey,
  resolveClientIp,
  rateLimitStore,
  rateLimits,
}: AppDeps) {
  const rules = { ...defaultRateLimits, ...rateLimits };
  const limit = (name: keyof RateLimitRules) => rateLimit(rateLimitStore, name, rules[name]);
  const app = new Hono<AppEnv>();

  app.use("*", requestId());
  app.use("*", requestLogger(logger));
  app.use("*", apiSecurityHeaders);
  app.use(
    "*",
    cors({
      origin: webOrigins,
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["content-type", "x-request-id"],
      exposeHeaders: ["x-request-id", "retry-after", "ratelimit-limit", "ratelimit-remaining"],
      maxAge: 600,
    }),
  );
  app.use("*", clientIp(resolveClientIp));

  app.route("/health", healthRoutes(services.health));

  app.use(
    "/v1/*",
    bodyLimit({
      maxSize: MAX_BODY_BYTES,
      onError: (c) =>
        c.json<ApiError>(errorBody("payload_too_large", "Request body too large"), 413),
    }),
  );
  app.on("GET", ["/v1/views/*", "/v1/reactions/*"], limit("read"));
  app.on("POST", ["/v1/views/*", "/v1/reactions/*"], limit("engage"));
  app.on("POST", ["/v1/subscribe", "/v1/contact"], limit("inbox"));
  app.use("/v1/stats", limit("admin"), adminAuth(adminApiKey));

  app.route("/v1/views", viewsRoutes(services.views));
  app.route("/v1/reactions", reactionsRoutes(services.reactions));
  app.route("/v1/subscribe", subscribeRoutes(services.newsletter));
  app.route("/v1/contact", contactRoutes(services.contact));
  app.route("/v1/stats", statsRoutes(services.stats));

  app.notFound((c) => c.json<ApiError>(errorBody("not_found", "Route not found"), 404));
  app.onError((err, c) => {
    if (err instanceof HttpError) {
      return c.json<ApiError>(errorBody(err.code, err.message), err.status);
    }
    if (err instanceof HTTPException && err.status < 500) {
      return c.json<ApiError>(errorBody("bad_request", err.message || "Bad request"), err.status);
    }
    const log = (c.get("logger") as Logger | undefined) ?? logger;
    log.error({ err }, "unhandled error");
    return c.json<ApiError>(errorBody("internal", "Internal server error"), 500);
  });

  return app;
}

export type App = ReturnType<typeof createApp>;
