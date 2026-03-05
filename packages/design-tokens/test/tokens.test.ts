import { describe, expect, it } from "vitest";
import { colorTokens } from "../src";

describe("design tokens", () => {
  it("defines brand foreground", () => {
    expect(colorTokens.foreground).toBe("#242327");
  });
});
