import { type z } from "zod";
import {
  healthResponseSchema,
  readinessResponseSchema,
  type HealthResponse,
  type ReadinessResponse,
} from "../schemas";

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  /** Extra init merged into every request (e.g. Next.js `next: { revalidate }`). */
  init?: RequestInit;
}

/**
 * Typed API client. The only sanctioned way for apps/web to read dynamic data.
 * Every response is validated against the shared zod schema at runtime.
 */
export function createApiClient({ baseUrl, fetch = globalThis.fetch, init }: ApiClientOptions) {
  const root = baseUrl.replace(/\/+$/, "");

  async function request<S extends z.ZodType>(path: string, schema: S): Promise<z.infer<S>> {
    const headers = new Headers(init?.headers);
    headers.set("accept", "application/json");
    const res = await fetch(`${root}${path}`, { ...init, headers });
    // 503 is a valid, schema-typed readiness response; let the schema decide.
    if (!res.ok && res.status !== 503) {
      throw new ApiClientError(`GET ${path} failed with ${res.status}`, res.status);
    }
    return schema.parse(await res.json());
  }

  return {
    health: (): Promise<HealthResponse> => request("/health", healthResponseSchema),
    ready: (): Promise<ReadinessResponse> => request("/health/ready", readinessResponseSchema),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
