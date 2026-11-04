import { pino, type Logger, type LoggerOptions } from "pino";

export function createLogger(options: LoggerOptions = {}): Logger {
  return pino({
    base: { service: "api" },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Defense in depth: never let secrets or PII leak into logs by accident.
    redact: {
      paths: ["req.headers.authorization", 'req.headers["x-admin-api-key"]', "email", "*.email"],
      censor: "[redacted]",
    },
    ...options,
  });
}
