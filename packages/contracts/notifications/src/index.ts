import { z } from "zod";

export const pushTokenUpsertSchema = z.object({
  deviceId: z.string().min(1),
  platform: z.enum(["ios", "android"]),
  expoPushToken: z.string().startsWith("ExponentPushToken[")
});

export const notificationsContract = {
  basePath: "/devices",
  routes: {
    upsertPushToken: {
      method: "PUT",
      path: "/push-token",
      request: pushTokenUpsertSchema,
      response: z.object({ success: z.literal(true) })
    }
  }
} as const;
