import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.DATABASE_URL ?? "";

console.log("DATABASE_URL length:", url.length);
console.log("Starts with postgresql:", url.startsWith("postgresql://"));

if (!url.startsWith("postgresql://")) {
  console.error(
    "\nWrong format. DATABASE_URL must be a Postgres connection string, NOT your Supabase project URL.\n" +
      "Get it from: Supabase → Project Settings → Database → Connection string → Transaction pooler (port 6543)"
  );
  process.exit(1);
}

async function main() {
  const sql = postgres(url, { prepare: false, connect_timeout: 15 });
  try {
    const [row] = await sql`SELECT 1 AS ok`;
    console.log("Connection OK:", row);

    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'chunks'
    `;
    console.log(
      tables.length
        ? "chunks table exists"
        : "chunks table MISSING — run supabase/schema.sql in SQL Editor"
    );
  } catch (error) {
    console.error(
      "Connection FAILED:",
      error instanceof Error ? error.message : error
    );
    console.error(
      "\nThe [YOUR-PASSWORD] part is your DATABASE PASSWORD (set when you created the Supabase project), not the project URL."
    );
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
