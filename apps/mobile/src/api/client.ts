import { GazelleApiClient } from "@gazelle/sdk-mobile";

export const apiClient = new GazelleApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.gazellecoffee.com/v1"
});
