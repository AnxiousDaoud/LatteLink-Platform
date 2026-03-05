import { describe, expect, it } from "vitest";
import { orderStatusSchema } from "../src";

describe("contracts-orders", () => {
  it("contains READY status", () => {
    expect(orderStatusSchema.options).toContain("READY");
  });
});
