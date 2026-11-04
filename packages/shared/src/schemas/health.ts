import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  version: z.string().min(1),
  uptime: z.number().nonnegative(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const readinessResponseSchema = z.object({
  status: z.enum(["ready", "not_ready"]),
  checks: z.object({
    database: z.enum(["up", "down"]),
  }),
});

export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
