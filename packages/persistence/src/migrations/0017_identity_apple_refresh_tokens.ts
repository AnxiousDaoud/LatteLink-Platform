import { sql, type Kysely } from "kysely";

type MigrationDb = Kysely<Record<string, never>>;

export async function up(db: MigrationDb): Promise<void> {
  await sql`
    ALTER TABLE identity_users
    ADD COLUMN IF NOT EXISTS apple_client_id TEXT
  `.execute(db);

  await sql`
    ALTER TABLE identity_users
    ADD COLUMN IF NOT EXISTS apple_refresh_token TEXT
  `.execute(db);
}

export async function down(db: MigrationDb): Promise<void> {
  await sql`
    ALTER TABLE identity_users
    DROP COLUMN IF EXISTS apple_refresh_token
  `.execute(db);

  await sql`
    ALTER TABLE identity_users
    DROP COLUMN IF EXISTS apple_client_id
  `.execute(db);
}
