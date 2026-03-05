import type { FastifyInstance } from "fastify";
import { z } from "zod";

const payloadSchema = z.object({
  id: z.string().uuid().optional()
});

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok", service: "identity" }));
  app.get("/ready", async () => ({ status: "ready", service: "identity" }));

  app.post("/v1/auth/internal/ping", async (request) => {
    const parsed = payloadSchema.parse(request.body ?? {});

    return {
      service: "identity",
      accepted: true,
      payload: parsed
    };
  });
}
