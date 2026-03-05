import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("loyalty service", () => {
  it("responds on /health", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    await app.close();
  });
});
