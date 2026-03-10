import { describe, expect, it } from "vitest";
import { menuResponseSchema, storeConfigResponseSchema } from "../src";

describe("contracts-catalog", () => {
  it("validates menu payload", () => {
    const payload = menuResponseSchema.parse({
      locationId: "flagship-01",
      currency: "USD",
      categories: [
        {
          id: "coffee",
          title: "Coffee",
          items: [
            {
              id: "latte",
              name: "Latte",
              description: "Espresso with steamed milk.",
              priceCents: 575,
              badgeCodes: ["popular"],
              visible: true
            }
          ]
        }
      ]
    });

    expect(payload.currency).toBe("USD");
    expect(payload.categories[0]?.items[0]?.name).toBe("Latte");
  });

  it("validates store config payload", () => {
    const config = storeConfigResponseSchema.parse({
      locationId: "flagship-01",
      prepEtaMinutes: 12,
      taxRateBasisPoints: 600,
      pickupInstructions: "Pickup at the flagship order counter."
    });

    expect(config.taxRateBasisPoints).toBe(600);
  });

  it("rejects invalid store tax rate", () => {
    expect(() =>
      storeConfigResponseSchema.parse({
        locationId: "flagship-01",
        prepEtaMinutes: 12,
        taxRateBasisPoints: 10001,
        pickupInstructions: "Pickup at the flagship order counter."
      })
    ).toThrow();
  });
});
