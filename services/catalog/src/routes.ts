import type { FastifyInstance } from "fastify";
import { z } from "zod";

const payloadSchema = z.object({
  id: z.string().uuid().optional()
});

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok", service: "catalog" }));
  app.get("/ready", async () => ({ status: "ready", service: "catalog" }));

  app.post("/v1/catalog/internal/ping", async (request) => {
    const parsed = payloadSchema.parse(request.body ?? {});

    return {
      service: "catalog",
      accepted: true,
      payload: parsed
    };
  });
}
