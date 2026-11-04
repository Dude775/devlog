import "server-only";
import { createApiClient } from "@devlog/shared/client";
import { getServerEnv } from "@/env";

/** Server-side API client. The web app never talks to the database; all dynamic data flows through here. */
export function getApi() {
  return createApiClient({
    baseUrl: getServerEnv().API_URL,
    init: { cache: "no-store", signal: AbortSignal.timeout(3000) },
  });
}
