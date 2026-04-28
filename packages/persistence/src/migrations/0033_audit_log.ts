import { sql, type Kysely } from "kysely";

type MigrationDb = Kysely<Record<string, never>>;

export async function up(db: MigrationDb): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      location_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_type TEXT NOT NULL,
      action TEXT NOT NULL,
      target_id TEXT,
      target_type TEXT,
      payload JSONB,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS audit_log_location_occurred_idx
    ON audit_log (location_id, occurred_at DESC)
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS audit_log_target_idx
    ON audit_log (target_type, target_id)
  `.execute(db);
}

export async function down(db: MigrationDb): Promise<void> {
  await sql`DROP TABLE IF EXISTS audit_log`.execute(db);
}
