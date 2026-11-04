import { z } from "zod";
import { reactionCountsSchema } from "./engagement";

export const statsResponseSchema = z.object({
  views: z.object({
    total: z.number().int().nonnegative(),
    top: z.array(z.object({ slug: z.string(), count: z.number().int().nonnegative() })),
  }),
  reactions: reactionCountsSchema,
  subscribers: z.object({
    total: z.number().int().nonnegative(),
    confirmed: z.number().int().nonnegative(),
  }),
  contactMessages: z.number().int().nonnegative(),
});
export type StatsResponse = z.infer<typeof statsResponseSchema>;

/** Header carrying the admin key for protected endpoints. */
export const ADMIN_API_KEY_HEADER = "x-admin-api-key";
