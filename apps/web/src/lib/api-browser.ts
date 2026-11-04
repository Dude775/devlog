import { type ApiClient, createApiClient } from "@devlog/shared/client";
import { publicEnv } from "@/env";

let client: ApiClient | undefined;

/**
 * Browser-side API client for interactive features. Calls the API directly (CORS-restricted to
 * WEB_ORIGIN) so the API sees the real client for rate limiting and unique-view hashing.
 * Callers must treat every failure as "feature unavailable" and render nothing.
 */
export function getBrowserApi(): ApiClient {
  client ??= createApiClient({ baseUrl: publicEnv.NEXT_PUBLIC_API_URL, timeoutMs: 4000 });
  return client;
}
