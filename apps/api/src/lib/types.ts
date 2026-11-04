import { type Logger } from "pino";

/** Hono env shared by every route and middleware. */
export interface AppEnv {
  Variables: {
    requestId: string;
    logger: Logger;
    /** Resolved client IP. Kept in memory for the request only; never persisted or logged. */
    clientIp: string;
  };
}
