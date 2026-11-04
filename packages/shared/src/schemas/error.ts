import { z } from "zod";

export const apiErrorCodes = [
  "bad_request",
  "validation_error",
  "unauthorized",
  "not_found",
  "payload_too_large",
  "rate_limited",
  "internal",
] as const;
export type ApiErrorCode = (typeof apiErrorCodes)[number];

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
