import { describe, it, expect } from "vitest";
import {
  orderEventSchema,
  orderStatusChannel,
  orderEventsChannel,
  type OrderEvent
} from "../src/index.js";

describe("channel helpers", () => {
  it("builds order status channel", () => {
    expect(orderStatusChannel("order-123")).toBe("order_status:order-123");
  });

  it("builds order events channel", () => {
    expect(orderEventsChannel("loc-456")).toBe("order_events:loc-456");
  });
});

describe("orderEventSchema", () => {
  const validEvent: OrderEvent = {
    orderId: "order-1",
    locationId: "loc-1",
    status: "IN_PREP",
    userId: "user-1",
    occurredAt: "2024-01-01T00:00:00.000Z",
    pickupCode: "A1B"
  };

  it("parses a valid event", () => {
    expect(orderEventSchema.safeParse(validEvent).success).toBe(true);
  });

  it("rejects event with missing orderId", () => {
    const input = { ...validEvent, orderId: undefined };
    expect(orderEventSchema.safeParse(input).success).toBe(false);
  });

  it("rejects event with missing locationId", () => {
    const input = { ...validEvent, locationId: undefined };
    expect(orderEventSchema.safeParse(input).success).toBe(false);
  });

  it("rejects event with missing status", () => {
    const input = { ...validEvent, status: undefined };
    expect(orderEventSchema.safeParse(input).success).toBe(false);
  });

  it("rejects event with missing userId", () => {
    const input = { ...validEvent, userId: undefined };
    expect(orderEventSchema.safeParse(input).success).toBe(false);
  });

  it("rejects event with missing occurredAt", () => {
    const input = { ...validEvent, occurredAt: undefined };
    expect(orderEventSchema.safeParse(input).success).toBe(false);
  });

  it("rejects event with missing pickupCode", () => {
    const input = { ...validEvent, pickupCode: undefined };
    expect(orderEventSchema.safeParse(input).success).toBe(false);
  });

  it("accepts event with optional note", () => {
    expect(orderEventSchema.safeParse({ ...validEvent, note: "Extra hot" }).success).toBe(true);
  });

  it("rejects non-object", () => {
    expect(orderEventSchema.safeParse("not-an-object").success).toBe(false);
    expect(orderEventSchema.safeParse(null).success).toBe(false);
    expect(orderEventSchema.safeParse(42).success).toBe(false);
  });
});
