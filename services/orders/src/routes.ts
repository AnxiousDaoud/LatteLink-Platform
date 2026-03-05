import type { FastifyInstance } from "fastify";
import { z } from "zod";

const payloadSchema = z.object({
  id: z.string().uuid().optional()
});

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok", service: "orders" }));
  app.get("/ready", async () => ({ status: "ready", service: "orders" }));

  app.post("/v1/orders/internal/ping", async (request) => {
    const parsed = payloadSchema.parse(request.body ?? {});

    return {
      service: "orders",
      accepted: true,
      payload: parsed
    };
  });
}
