import { type z } from "zod";
import {
  ADMIN_API_KEY_HEADER,
  apiErrorSchema,
  contactResponseSchema,
  healthResponseSchema,
  postViewsResponseSchema,
  reactionsResponseSchema,
  readinessResponseSchema,
  statsResponseSchema,
  subscribeResponseSchema,
  type ContactRequest,
  type ContactResponse,
  type HealthResponse,
  type PostViewsResponse,
  type ReactionsResponse,
  type ReactionType,
  type ReadinessResponse,
  type StatsResponse,
  type SubscribeRequest,
  type SubscribeResponse,
} from "../schemas";

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** `error.code` from the API's `{ error: { code, message } }` body, when present. */
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  /** Extra init merged into every request (e.g. Next.js `next: { revalidate }`, `signal`). */
  init?: RequestInit;
  /** Per-request timeout in ms (creates a fresh AbortSignal per call). */
  timeoutMs?: number;
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
  /** Statuses whose body is a valid schema response despite !ok (e.g. readiness 503). */
  acceptStatus?: number[];
}

/**
 * Typed API client. The only sanctioned way for apps/web to read or write dynamic data.
 * Runtime-agnostic (fetch only). Every response is validated against the shared zod schema.
 */
export function createApiClient({
  baseUrl,
  fetch = globalThis.fetch,
  init,
  timeoutMs,
}: ApiClientOptions) {
  const root = baseUrl.replace(/\/+$/, "");

  async function request<S extends z.ZodType>(
    path: string,
    schema: S,
    { method = "GET", body, headers: extra, acceptStatus = [] }: RequestOptions = {},
  ): Promise<z.infer<S>> {
    const headers = new Headers(init?.headers);
    headers.set("accept", "application/json");
    if (body !== undefined) headers.set("content-type", "application/json");
    for (const [k, v] of Object.entries(extra ?? {})) headers.set(k, v);

    const signal = timeoutMs === undefined ? init?.signal : AbortSignal.timeout(timeoutMs);
    const res = await fetch(`${root}${path}`, {
      ...init,
      method,
      headers,
      ...(signal ? { signal } : {}),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok && !acceptStatus.includes(res.status)) {
      const parsed = apiErrorSchema.safeParse(await res.json().catch(() => null));
      const message = parsed.success
        ? parsed.data.error.message
        : `${method} ${path} failed with ${res.status}`;
      throw new ApiClientError(message, res.status, parsed.data?.error.code);
    }
    return schema.parse(await res.json());
  }

  const slugPath = (prefix: string, slug: string) => `${prefix}/${encodeURIComponent(slug)}`;

  return {
    health: (): Promise<HealthResponse> => request("/health", healthResponseSchema),
    ready: (): Promise<ReadinessResponse> =>
      request("/health/ready", readinessResponseSchema, { acceptStatus: [503] }),

    views: {
      get: (slug: string): Promise<PostViewsResponse> =>
        request(slugPath("/v1/views", slug), postViewsResponseSchema),
      /** Records a view (deduplicated server-side per visitor per day) and returns the count. */
      record: (slug: string): Promise<PostViewsResponse> =>
        request(slugPath("/v1/views", slug), postViewsResponseSchema, { method: "POST" }),
    },

    reactions: {
      get: (slug: string): Promise<ReactionsResponse> =>
        request(slugPath("/v1/reactions", slug), reactionsResponseSchema),
      add: (slug: string, type: ReactionType): Promise<ReactionsResponse> =>
        request(slugPath("/v1/reactions", slug), reactionsResponseSchema, {
          method: "POST",
          body: { type },
        }),
    },

    subscribe: (input: SubscribeRequest): Promise<SubscribeResponse> =>
      request("/v1/subscribe", subscribeResponseSchema, { method: "POST", body: input }),

    contact: (input: ContactRequest): Promise<ContactResponse> =>
      request("/v1/contact", contactResponseSchema, { method: "POST", body: input }),

    stats: (adminApiKey: string): Promise<StatsResponse> =>
      request("/v1/stats", statsResponseSchema, {
        headers: { [ADMIN_API_KEY_HEADER]: adminApiKey },
      }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
