import { describe, expect, it } from "vitest";
import { moneySchema } from "../src";

describe("contracts-core", () => {
  it("validates usd money", () => {
    expect(moneySchema.parse({ currency: "USD", amountCents: 10 }).amountCents).toBe(10);
  });
});
