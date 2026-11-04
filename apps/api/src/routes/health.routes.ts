import { Hono } from "hono";
import { type HealthService } from "../services/health.service";

export function healthRoutes(service: HealthService) {
  return new Hono()
    .get("/", (c) => c.json(service.liveness()))
    .get("/ready", async (c) => {
      const result = await service.readiness();
      return c.json(result, result.status === "ready" ? 200 : 503);
    });
}
