import { describe, expect, it } from "vitest";
import { appleExchangeRequestSchema } from "../src";

describe("contracts-auth", () => {
  it("validates apple exchange payload", () => {
    const data = appleExchangeRequestSchema.parse({
      identityToken: "token",
      authorizationCode: "code",
      nonce: "nonce"
    });

    expect(data.authorizationCode).toBe("code");
  });
});
