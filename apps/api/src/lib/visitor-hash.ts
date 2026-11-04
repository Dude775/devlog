import { createHmac } from "node:crypto";

export interface VisitorInput {
  ip: string;
  userAgent: string;
  /** UTC day, `YYYY-MM-DD`. Part of the hash so identifiers rotate daily and cannot be joined. */
  day: string;
}

export type VisitorHasher = (input: VisitorInput) => string;

/**
 * HMAC-SHA256(salt, day|ip|ua). Keyed (not a bare hash) because the IPv4 space is small enough
 * to brute-force an unkeyed digest. The raw IP never leaves the request.
 */
export function createVisitorHasher(salt: string): VisitorHasher {
  return ({ ip, userAgent, day }) =>
    createHmac("sha256", salt).update(`${day}|${ip}|${userAgent}`).digest("hex");
}

export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
