import { type HealthResponse, type ReadinessResponse } from "@devlog/shared/schemas";
import { type HealthRepository } from "../repositories/health.repository";

export interface HealthService {
  liveness: () => HealthResponse;
  readiness: () => Promise<ReadinessResponse>;
}

export interface HealthServiceDeps {
  repository: HealthRepository;
  version: string;
  uptime?: () => number;
}

export function createHealthService({
  repository,
  version,
  uptime = () => process.uptime(),
}: HealthServiceDeps): HealthService {
  return {
    liveness: () => ({ status: "ok", version, uptime: Math.round(uptime() * 1000) / 1000 }),
    async readiness() {
      const dbUp = await repository.pingDatabase();
      return {
        status: dbUp ? "ready" : "not_ready",
        checks: { database: dbUp ? "up" : "down" },
      };
    },
  };
}
