import { describe, expect, it } from "vitest";
import { isAbortedCheckoutOrder } from "../src/account/data";

describe("order history visibility", () => {
  it("treats canceled unpaid orders as aborted checkout attempts", () => {
    expect(
      isAbortedCheckoutOrder({
        id: "123e4567-e89b-12d3-a456-426614174000",
        status: "CANCELED",
        pickupCode: "ABC123",
        items: [],
        total: {
          currency: "USD",
          amountCents: 650
        },
        timeline: [
          {
            status: "PENDING_PAYMENT",
            occurredAt: "2026-04-22T12:00:00.000Z",
            note: "Order created from quote"
          },
          {
            status: "CANCELED",
            occurredAt: "2026-04-22T12:01:00.000Z",
            note: "Customer abandoned checkout before payment confirmation"
          }
        ]
      })
    ).toBe(true);
  });

  it("keeps canceled paid orders visible", () => {
    expect(
      isAbortedCheckoutOrder({
        id: "123e4567-e89b-12d3-a456-426614174001",
        status: "CANCELED",
        pickupCode: "PAID01",
        items: [],
        total: {
          currency: "USD",
          amountCents: 650
        },
        timeline: [
          {
            status: "PENDING_PAYMENT",
            occurredAt: "2026-04-22T12:00:00.000Z",
            note: "Order created from quote"
          },
          {
            status: "PAID",
            occurredAt: "2026-04-22T12:01:00.000Z",
            note: "Payment confirmed."
          },
          {
            status: "CANCELED",
            occurredAt: "2026-04-22T12:02:00.000Z",
            note: "Order canceled."
          }
        ]
      })
    ).toBe(false);
  });
});
