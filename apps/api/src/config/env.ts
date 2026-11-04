import { z } from "zod";

const DEV_HASH_SALT = "dev-only-insecure-view-hash-salt-change-me";

/** Treat `KEY=` (empty, common in .env and compose) as unset. */
const optionalSecret = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().min(32).optional(),
);

const csv = (fallback: string) =>
  z
    .string()
    .default(fallback)
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    HOST: z.string().default("0.0.0.0"),
    LOG_LEVEL: z
      .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
      .default("info"),
    DATABASE_URL: z.url(),
    /** Allowed browser origin(s) for CORS, comma-separated. */
    WEB_ORIGIN: csv("http://localhost:3000"),
    /** Enables GET /v1/stats when set. Sent as the `x-admin-api-key` header. */
    ADMIN_API_KEY: optionalSecret,
    /** HMAC secret for visitor hashes (unique views/reactions). Required in production. */
    VIEW_HASH_SALT: optionalSecret,
    /** Read the client IP from X-Forwarded-For. Enable only behind a trusted reverse proxy. */
    TRUST_PROXY: z
      .enum(["true", "false", "1", "0"])
      .default("false")
      .transform((v) => v === "true" || v === "1"),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production" && !env.VIEW_HASH_SALT) {
      ctx.addIssue({
        code: "custom",
        path: ["VIEW_HASH_SALT"],
        message: "VIEW_HASH_SALT is required in production",
      });
    }
  })
  .transform((env) => ({ ...env, VIEW_HASH_SALT: env.VIEW_HASH_SALT ?? DEV_HASH_SALT }));

export type Env = z.infer<typeof envSchema>;

/** Parse and validate env. Fails fast with a readable error; never read process.env elsewhere. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

/** Opt-in Postgres for repository integration tests (CI provides a service container). */
export function testDatabaseUrl(source: NodeJS.ProcessEnv = process.env): string | undefined {
  const url = source.TEST_DATABASE_URL;
  return url === "" ? undefined : url;
}
