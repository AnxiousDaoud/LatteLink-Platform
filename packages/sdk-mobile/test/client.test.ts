import { describe, expect, it } from "vitest";
import { GazelleApiClient } from "../src";

describe("sdk-mobile", () => {
  it("creates client instance", () => {
    const client = new GazelleApiClient({ baseUrl: "https://api.gazellecoffee.com/v1" });
    expect(client).toBeInstanceOf(GazelleApiClient);
  });
});
