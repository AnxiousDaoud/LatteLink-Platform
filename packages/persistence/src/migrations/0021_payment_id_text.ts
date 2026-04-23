import { sql, type Kysely } from "kysely";

type MigrationDb = Kysely<Record<string, never>>;

export async function up(db: MigrationDb): Promise<void> {
  await sql`ALTER TABLE payments_charges ALTER COLUMN payment_id TYPE TEXT`.execute(db);
  await sql`ALTER TABLE payments_refunds ALTER COLUMN payment_id TYPE TEXT`.execute(db);
  await sql`ALTER TABLE orders ALTER COLUMN payment_id TYPE TEXT`.execute(db);
}

export async function down(db: MigrationDb): Promise<void> {
  await sql`ALTER TABLE payments_charges ALTER COLUMN payment_id TYPE UUID USING payment_id::uuid`.execute(db);
  await sql`ALTER TABLE payments_refunds ALTER COLUMN payment_id TYPE UUID USING payment_id::uuid`.execute(db);
  await sql`ALTER TABLE orders ALTER COLUMN payment_id TYPE UUID USING payment_id::uuid`.execute(db);
}
