import type { FastifyInstance } from "fastify";
import { z } from "zod";

const payloadSchema = z.object({
  id: z.string().uuid().optional()
});

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok", service: "notifications" }));
  app.get("/ready", async () => ({ status: "ready", service: "notifications" }));

  app.post("/v1/notifications/internal/ping", async (request) => {
    const parsed = payloadSchema.parse(request.body ?? {});

    return {
      service: "notifications",
      accepted: true,
      payload: parsed
    };
  });
}
