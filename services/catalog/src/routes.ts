import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { menuResponseSchema, storeConfigResponseSchema } from "@gazelle/contracts-catalog";

const payloadSchema = z.object({
  id: z.string().uuid().optional()
});

const locationId = "flagship-01";

const menuPayload = menuResponseSchema.parse({
  locationId,
  currency: "USD",
  categories: [
    {
      id: "espresso",
      title: "Espresso Bar",
      items: [
        {
          id: "cortado",
          name: "Cortado",
          description: "Double espresso cut with steamed milk.",
          priceCents: 475,
          badgeCodes: ["new"],
          visible: true
        },
        {
          id: "flat-white",
          name: "Flat White",
          description: "Silky microfoam over ristretto shots.",
          priceCents: 525,
          badgeCodes: ["popular"],
          visible: true
        }
      ]
    },
    {
      id: "cold",
      title: "Cold Drinks",
      items: [
        {
          id: "flash-brew",
          name: "Flash Brew",
          description: "Single-origin coffee brewed hot and chilled over ice.",
          priceCents: 495,
          badgeCodes: [],
          visible: true
        },
        {
          id: "seasonal-tonic",
          name: "Seasonal Espresso Tonic",
          description: "House tonic with citrus and espresso.",
          priceCents: 575,
          badgeCodes: ["seasonal"],
          visible: false
        }
      ]
    }
  ]
});

const storeConfigPayload = storeConfigResponseSchema.parse({
  locationId,
  prepEtaMinutes: 12,
  taxRateBasisPoints: 600,
  pickupInstructions: "Pickup at the flagship order counter."
});

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok", service: "catalog" }));
  app.get("/ready", async () => ({ status: "ready", service: "catalog" }));

  app.get("/v1/menu", async () => menuPayload);

  app.get("/v1/store/config", async () => storeConfigPayload);

  app.post("/v1/catalog/internal/ping", async (request) => {
    const parsed = payloadSchema.parse(request.body ?? {});

    return {
      service: "catalog",
      accepted: true,
      payload: parsed
    };
  });
}
