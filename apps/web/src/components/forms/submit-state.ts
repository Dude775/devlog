import { ApiClientError } from "@devlog/shared/client";

export type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

/** Maps any failure to a calm, user-facing message. Never surfaces raw errors. */
export function failureMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    if (error.code === "rate_limited")
      return "Too many attempts. Please try again in a few minutes.";
    if (error.code === "validation_error") return "Please check the fields and try again.";
  }
  return fallback;
}
