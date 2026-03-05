import type { FastifyInstance } from "fastify";
import { z } from "zod";

const payloadSchema = z.object({
  id: z.string().uuid().optional()
});

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok", service: "loyalty" }));
  app.get("/ready", async () => ({ status: "ready", service: "loyalty" }));

  app.post("/v1/loyalty/internal/ping", async (request) => {
    const parsed = payloadSchema.parse(request.body ?? {});

    return {
      service: "loyalty",
      accepted: true,
      payload: parsed
    };
  });
}
