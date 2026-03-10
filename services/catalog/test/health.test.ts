import { describe, expect, it } from "vitest";
import { menuResponseSchema, storeConfigResponseSchema } from "@gazelle/contracts-catalog";
import { buildApp } from "../src/app.js";

describe("catalog service", () => {
  it("responds on /health", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    await app.close();
  });

  it("returns v1 menu payload", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/v1/menu" });

    expect(response.statusCode).toBe(200);
    const parsed = menuResponseSchema.parse(response.json());
    expect(parsed.categories.length).toBeGreaterThan(0);
    await app.close();
  });

  it("returns v1 store config payload", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/v1/store/config" });

    expect(response.statusCode).toBe(200);
    const parsed = storeConfigResponseSchema.parse(response.json());
    expect(parsed.prepEtaMinutes).toBeGreaterThan(0);
    await app.close();
  });
});
