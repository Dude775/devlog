import { z } from "zod";

/** Post slug as produced by velite: lowercase kebab-case. */
export const slugSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug");

export const slugParamsSchema = z.object({ slug: slugSchema });

export const postViewsResponseSchema = z.object({
  slug: slugSchema,
  count: z.number().int().nonnegative(),
});
export type PostViewsResponse = z.infer<typeof postViewsResponseSchema>;

export const reactionTypes = ["fire", "brain", "rocket"] as const;
export const reactionTypeSchema = z.enum(reactionTypes);
export type ReactionType = z.infer<typeof reactionTypeSchema>;

export const reactionCountsSchema = z.object({
  fire: z.number().int().nonnegative(),
  brain: z.number().int().nonnegative(),
  rocket: z.number().int().nonnegative(),
});
export type ReactionCounts = z.infer<typeof reactionCountsSchema>;

export const addReactionRequestSchema = z.object({ type: reactionTypeSchema });
export type AddReactionRequest = z.infer<typeof addReactionRequestSchema>;

export const reactionsResponseSchema = z.object({
  slug: slugSchema,
  counts: reactionCountsSchema,
});
export type ReactionsResponse = z.infer<typeof reactionsResponseSchema>;
