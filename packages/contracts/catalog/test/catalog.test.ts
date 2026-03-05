import { describe, expect, it } from "vitest";
import { menuResponseSchema } from "../src";

describe("contracts-catalog", () => {
  it("validates menu payload", () => {
    const payload = menuResponseSchema.parse({
      locationId: "flagship-01",
      currency: "USD",
      categories: []
    });

    expect(payload.currency).toBe("USD");
  });
});
