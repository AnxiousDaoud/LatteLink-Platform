import { describe, expect, it } from "vitest";
import { pushTokenUpsertSchema } from "../src";

describe("contracts-notifications", () => {
  it("validates expo token envelope", () => {
    const parsed = pushTokenUpsertSchema.parse({
      deviceId: "device-1",
      platform: "ios",
      expoPushToken: "ExponentPushToken[abc]"
    });

    expect(parsed.platform).toBe("ios");
  });
});
