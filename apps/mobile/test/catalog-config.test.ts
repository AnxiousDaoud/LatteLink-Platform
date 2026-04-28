import { appConfigSchema } from "@lattelink/contracts-catalog";
import { describe, expect, it } from "vitest";
import {
  isMobileLoyaltyVisible,
  isMobileOrderTrackingEnabled,
  resolveAppConfigData,
  resolveMenuImageUrl
} from "../src/menu/catalog";

const baseConfig = appConfigSchema.parse({
  brand: {
    brandId: "rawaqcoffee",
    brandName: "Rawaq Coffee",
    locationId: "rawaqcoffee01",
    locationName: "Rawaq Coffee Flagship",
    marketLabel: "Ann Arbor, MI"
  },
  theme: {
    background: "#F7F4ED",
    backgroundAlt: "#F0ECE4",
    surface: "#FFFDF8",
    surfaceMuted: "#F3EFE7",
    foreground: "#171513",
    foregroundMuted: "#605B55",
    muted: "#9B9389",
    border: "rgba(23, 21, 19, 0.08)",
    primary: "#1E1B18",
    accent: "#2D2823",
    fontFamily: "System",
    displayFontFamily: "Fraunces"
  },
  enabledTabs: ["home", "menu", "orders", "account"],
  featureFlags: {
    loyalty: true,
    pushNotifications: true,
    refunds: true,
    orderTracking: true,
    staffDashboard: false,
    menuEditing: false
  },
  loyaltyEnabled: true,
  paymentCapabilities: {
    applePay: true,
    card: true,
    cash: false,
    refunds: true,
    stripe: {
      enabled: true,
      onboarded: true,
      dashboardEnabled: false
    },
    clover: {
      enabled: true,
      merchantRef: "rawaqcoffee01"
    }
  },
  fulfillment: {
    mode: "time_based",
    timeBasedScheduleMinutes: {
      inPrep: 5,
      ready: 10,
      completed: 15
    }
  }
});

describe("mobile catalog config", () => {
  it("returns undefined when app-config is unavailable", () => {
    expect(resolveAppConfigData(undefined)).toBeUndefined();
    expect(isMobileLoyaltyVisible(undefined)).toBe(false);
    expect(isMobileOrderTrackingEnabled(undefined)).toBe(false);
  });

  it("uses store capabilities as the runtime source of truth", () => {
    const config = resolveAppConfigData({
      ...baseConfig,
      storeCapabilities: {
        menu: {
          source: "external_sync"
        },
        operations: {
          fulfillmentMode: "staff",
          liveOrderTrackingEnabled: false,
          dashboardEnabled: false
        },
        loyalty: {
          visible: false
        }
      }
    });

    expect(config).toBeDefined();
    expect(isMobileLoyaltyVisible(config)).toBe(false);
    expect(isMobileOrderTrackingEnabled(config)).toBe(false);
    expect(config?.featureFlags.menuEditing).toBe(false);
    expect(config?.fulfillment.mode).toBe("staff");
  });

  it("resolves optimized mobile menu image variants from original media URLs", () => {
    const original =
      "https://media.nomly.us/brands/rawaqcoffee/locations/rawaqcoffee01/menu-items/latte/original/2026-04-24T03-18-42-279Z-447a193e-latte.png";

    expect(resolveMenuImageUrl(original, "list")).toBe(
      "https://media.nomly.us/brands/rawaqcoffee/locations/rawaqcoffee01/menu-items/latte/mobile-list/2026-04-24T03-18-42-279Z-447a193e-latte.jpg"
    );
    expect(resolveMenuImageUrl(original, "hero")).toBe(
      "https://media.nomly.us/brands/rawaqcoffee/locations/rawaqcoffee01/menu-items/latte/mobile-hero/2026-04-24T03-18-42-279Z-447a193e-latte.jpg"
    );
  });
});
