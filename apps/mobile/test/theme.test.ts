import { describe, expect, it } from "vitest";
import { mobileTheme } from "../src/theme/tokens";

describe("mobile theme", () => {
  it("inherits design token foreground", () => {
    expect(mobileTheme.colorTokens.foreground).toBe("#242327");
  });
});
