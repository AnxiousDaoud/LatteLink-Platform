import { describe, expect, it } from "vitest";
import { orderStatusSchema, ordersPaymentReconciliationSchema } from "../src";

describe("contracts-orders", () => {
  it("contains READY status", () => {
    expect(orderStatusSchema.options).toContain("READY");
  });

  it("accepts internal payment reconciliation payloads", () => {
    const parsed = ordersPaymentReconciliationSchema.parse({
      provider: "CLOVER",
      kind: "CHARGE",
      orderId: "123e4567-e89b-12d3-a456-426614174000",
      paymentId: "123e4567-e89b-12d3-a456-426614174001",
      status: "SUCCEEDED",
      occurredAt: "2026-03-11T00:00:00.000Z"
    });
    expect(parsed.kind).toBe("CHARGE");
  });
});
