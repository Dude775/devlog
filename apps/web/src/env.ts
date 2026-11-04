import { z } from "zod";

const serverSchema = z.object({
  API_URL: z.url().default("http://localhost:4000"),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  /** Browser-facing API base URL (views, reactions, forms). Must be in the API's WEB_ORIGIN CORS list. */
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:4000"),
});

function parse<S extends z.ZodType>(schema: S, input: Record<string, string | undefined>) {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  return result.data;
}

/** Public env: safe in client bundles. NEXT_PUBLIC_* must be referenced literally to be inlined. */
export const publicEnv = parse(publicSchema, {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

/** Server env: import only from server code (see src/lib/api.ts). */
export function getServerEnv() {
  return parse(serverSchema, { API_URL: process.env.API_URL });
}
