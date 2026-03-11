import { describe, expect, it } from "vitest";
import { extractApplePayWalletPayload } from "../src/orders/applePayPayload";

const sampleWalletPayload = {
  version: "EC_v1",
  data: "wallet-data",
  signature: "wallet-signature",
  header: {
    ephemeralPublicKey: "ephemeral-key",
    publicKeyHash: "public-key-hash",
    transactionId: "transaction-id"
  }
};

describe("apple pay payload extraction", () => {
  it("extracts wallet payload when response already matches contract shape", () => {
    expect(extractApplePayWalletPayload(sampleWalletPayload)).toEqual(sampleWalletPayload);
  });

  it("extracts wallet payload from nested token response", () => {
    expect(extractApplePayWalletPayload({ token: sampleWalletPayload })).toEqual(sampleWalletPayload);
  });

  it("extracts wallet payload from json string response", () => {
    expect(extractApplePayWalletPayload(JSON.stringify(sampleWalletPayload))).toEqual(sampleWalletPayload);
  });

  it("returns null for unsupported payload structures", () => {
    expect(extractApplePayWalletPayload({ foo: "bar" })).toBeNull();
  });
});
