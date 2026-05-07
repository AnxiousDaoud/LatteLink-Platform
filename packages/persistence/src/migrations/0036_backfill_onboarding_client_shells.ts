import { sql, type Kysely } from "kysely";

type MigrationDb = Kysely<Record<string, never>>;

export async function up(db: MigrationDb): Promise<void> {
  await sql`
    WITH app_by_location AS (
      SELECT DISTINCT ON (location_id)
        location_id,
        brand_id,
        app_config_json,
        updated_at
      FROM catalog_app_configs
      ORDER BY location_id, updated_at DESC, brand_id ASC
    ),
    legacy_locations AS (
      SELECT
        store.location_id,
        COALESCE(NULLIF(app.brand_id, ''), NULLIF(store.brand_id, ''), store.location_id) AS brand_id,
        COALESCE(NULLIF(app.app_config_json #>> '{brand,brandName}', ''), NULLIF(store.store_name, ''), store.location_id) AS brand_name,
        COALESCE(NULLIF(app.app_config_json #>> '{brand,locationName}', ''), NULLIF(store.store_name, ''), store.location_id) AS location_name,
        COALESCE(NULLIF(app.app_config_json #>> '{brand,marketLabel}', ''), 'Unassigned market') AS market_label,
        store.created_at,
        store.updated_at
      FROM catalog_store_configs store
      LEFT JOIN app_by_location app ON app.location_id = store.location_id
    )
    INSERT INTO catalog_clients (
      tenant_id,
      brand_id,
      client_name,
      status,
      created_at,
      updated_at
    )
    SELECT DISTINCT ON (brand_id)
      'ten_bf_' || substr(md5(brand_id), 1, 16),
      brand_id,
      brand_name,
      'in_progress',
      created_at,
      updated_at
    FROM legacy_locations
    ORDER BY brand_id, created_at ASC, location_id ASC
    ON CONFLICT DO NOTHING
  `.execute(db);

  await sql`
    WITH app_by_location AS (
      SELECT DISTINCT ON (location_id)
        location_id,
        brand_id,
        app_config_json,
        updated_at
      FROM catalog_app_configs
      ORDER BY location_id, updated_at DESC, brand_id ASC
    ),
    legacy_locations AS (
      SELECT
        store.location_id,
        COALESCE(NULLIF(app.brand_id, ''), NULLIF(store.brand_id, ''), store.location_id) AS brand_id,
        COALESCE(NULLIF(app.app_config_json #>> '{brand,locationName}', ''), NULLIF(store.store_name, ''), store.location_id) AS location_name,
        COALESCE(NULLIF(app.app_config_json #>> '{brand,marketLabel}', ''), 'Unassigned market') AS market_label,
        store.created_at,
        store.updated_at
      FROM catalog_store_configs store
      LEFT JOIN app_by_location app ON app.location_id = store.location_id
    ),
    ranked_locations AS (
      SELECT
        legacy_locations.*,
        row_number() OVER (PARTITION BY brand_id ORDER BY created_at ASC, location_id ASC) AS location_rank
      FROM legacy_locations
    )
    INSERT INTO catalog_client_locations (
      tenant_id,
      location_id,
      brand_id,
      location_name,
      market_label,
      primary_location,
      created_at,
      updated_at
    )
    SELECT
      clients.tenant_id,
      ranked_locations.location_id,
      ranked_locations.brand_id,
      ranked_locations.location_name,
      ranked_locations.market_label,
      ranked_locations.location_rank = 1,
      ranked_locations.created_at,
      ranked_locations.updated_at
    FROM ranked_locations
    JOIN catalog_clients clients ON clients.brand_id = ranked_locations.brand_id
    ON CONFLICT (location_id) DO NOTHING
  `.execute(db);

  await sql`
    WITH app_by_location AS (
      SELECT DISTINCT ON (location_id)
        location_id,
        brand_id,
        app_config_json,
        updated_at
      FROM catalog_app_configs
      ORDER BY location_id, updated_at DESC, brand_id ASC
    ),
    location_readiness AS (
      SELECT
        locations.tenant_id,
        locations.location_id,
        locations.updated_at,
        (
          NULLIF(app.app_config_json #>> '{brand,brandName}', '') IS NOT NULL
          AND NULLIF(app.app_config_json #>> '{brand,locationName}', '') IS NOT NULL
          AND NULLIF(app.app_config_json #>> '{brand,marketLabel}', '') IS NOT NULL
        ) AS business_profile_complete,
        (
          NULLIF(store.hours_text, '') IS NOT NULL
          AND NULLIF(store.pickup_instructions, '') IS NOT NULL
          AND store.tax_rate_basis_points > 0
        ) AS store_operations_complete,
        EXISTS (
          SELECT 1
          FROM catalog_menu_items menu_items
          WHERE menu_items.location_id = locations.location_id
            AND menu_items.visible = TRUE
        ) AS menu_ready,
        EXISTS (
          SELECT 1
          FROM operator_owner_invites invites
          WHERE invites.location_id = locations.location_id
            AND invites.consumed_at IS NULL
            AND invites.revoked_at IS NULL
            AND invites.expires_at > NOW()
        ) AS pending_owner_invite,
        EXISTS (
          SELECT 1
          FROM operator_users users
          LEFT JOIN operator_location_access access
            ON access.operator_user_id = users.operator_user_id
          WHERE users.role = 'owner'
            AND users.active = TRUE
            AND (
              users.location_id = locations.location_id
              OR access.location_id = locations.location_id
            )
        ) AS active_owner
      FROM catalog_client_locations locations
      JOIN catalog_store_configs store ON store.location_id = locations.location_id
      LEFT JOIN app_by_location app ON app.location_id = locations.location_id
    )
    INSERT INTO catalog_onboarding_progress (
      location_id,
      tenant_id,
      status,
      owner_invited,
      owner_activated,
      business_profile_complete,
      store_operations_complete,
      menu_ready,
      team_configured_or_skipped,
      test_order_completed,
      admin_launch_approved,
      created_at,
      updated_at
    )
    SELECT
      location_id,
      tenant_id,
      CASE
        WHEN active_owner
          OR pending_owner_invite
          OR business_profile_complete
          OR store_operations_complete
          OR menu_ready
        THEN 'in_progress'
        ELSE 'draft'
      END,
      active_owner OR pending_owner_invite,
      active_owner,
      business_profile_complete,
      store_operations_complete,
      menu_ready,
      active_owner,
      FALSE,
      FALSE,
      updated_at,
      updated_at
    FROM location_readiness
    ON CONFLICT (location_id) DO NOTHING
  `.execute(db);

  await sql`
    INSERT INTO catalog_mobile_release_profiles (
      location_id,
      tenant_id,
      status,
      created_at,
      updated_at
    )
    SELECT
      locations.location_id,
      locations.tenant_id,
      'not_started',
      locations.created_at,
      locations.updated_at
    FROM catalog_client_locations locations
    ON CONFLICT (location_id) DO NOTHING
  `.execute(db);
}

export async function down(db: MigrationDb): Promise<void> {
  await sql`
    DELETE FROM catalog_clients
    WHERE tenant_id LIKE 'ten_bf_%'
  `.execute(db);
}
