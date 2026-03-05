import { z } from "zod";

export const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  priceCents: z.number().int().nonnegative(),
  badgeCodes: z.array(z.string()),
  visible: z.boolean()
});

export const menuCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(menuItemSchema)
});

export const menuResponseSchema = z.object({
  locationId: z.string(),
  currency: z.literal("USD"),
  categories: z.array(menuCategorySchema)
});

export const storeConfigResponseSchema = z.object({
  locationId: z.string(),
  prepEtaMinutes: z.number().int().positive(),
  taxRateBasisPoints: z.number().int().nonnegative(),
  pickupInstructions: z.string()
});

export const catalogContract = {
  basePath: "/catalog",
  routes: {
    menu: {
      method: "GET",
      path: "/menu",
      request: z.undefined(),
      response: menuResponseSchema
    },
    storeConfig: {
      method: "GET",
      path: "/store/config",
      request: z.undefined(),
      response: storeConfigResponseSchema
    }
  }
} as const;
