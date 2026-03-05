import { menuResponseSchema } from "@gazelle/contracts-catalog";

const intervalMs = Number(process.env.MENU_SYNC_INTERVAL_MS ?? 300000);
const sourceUrl = process.env.WEBAPP_MENU_SOURCE_URL ?? "https://webapp.gazellecoffee.com/api/content/public";

async function syncOnce() {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Menu source responded with ${response.status}`);
  }

  const payload = await response.json();

  const parsed = menuResponseSchema.safeParse({
    locationId: "flagship-01",
    currency: "USD",
    categories: payload?.menu?.categories ?? []
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  // TODO: persist parsed menu into catalog schema tables.
  console.log(`[menu-sync] synced ${parsed.data.categories.length} categories`);
}

async function run() {
  await syncOnce();
  setInterval(() => {
    void syncOnce().catch((error) => {
      console.error("[menu-sync] sync failed", error);
    });
  }, intervalMs);
}

run().catch((error) => {
  console.error("[menu-sync] fatal", error);
  process.exit(1);
});
