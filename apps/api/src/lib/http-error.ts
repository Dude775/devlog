import { type ApiErrorCode } from "@devlog/shared/schemas";
import { type Context } from "hono";
import { type ContentfulStatusCode } from "hono/utils/http-status";
import { type z } from "zod";

/** Thrown anywhere in the request path; rendered by `app.onError` as `{ error: { code, message } }`. */
export class HttpError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function errorBody(code: ApiErrorCode, message: string) {
  return { error: { code, message } };
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((i) => (i.path.length > 0 ? `${i.path.join(".")}: ${i.message}` : i.message))
    .join("; ");
}

/** Validate untrusted input against a shared zod schema; 400 `validation_error` on failure. */
export function parseInput<S extends z.ZodType>(schema: S, value: unknown): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, "validation_error", formatIssues(result.error));
  return result.data;
}

export async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    throw new HttpError(400, "bad_request", "Request body must be valid JSON");
  }
}
