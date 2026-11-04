import { z } from "zod";

/** Normalized before validation so " Dev@Example.com " is accepted and stored lowercase. */
const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));

/**
 * Honeypot field. Real users never see or fill it; bots usually do.
 * Accepted by the schema (so bots get a normal 202) and dropped by the service.
 */
const honeypotSchema = z.string().max(500).optional();

export const subscribeRequestSchema = z.object({
  email: emailSchema,
  website: honeypotSchema,
});
export type SubscribeRequest = z.input<typeof subscribeRequestSchema>;

/** Always `pending`, whether new, duplicate or dropped: no email enumeration. */
export const subscribeResponseSchema = z.object({ status: z.literal("pending") });
export type SubscribeResponse = z.infer<typeof subscribeResponseSchema>;

export const contactRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailSchema,
  message: z.string().trim().min(10).max(5000),
  website: honeypotSchema,
});
export type ContactRequest = z.input<typeof contactRequestSchema>;

export const contactResponseSchema = z.object({ status: z.literal("received") });
export type ContactResponse = z.infer<typeof contactResponseSchema>;
