import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function runMigration() {
  const sqlPath = resolve(__dirname, "../docs/schema.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log("Running schema migration...");
  console.log(`Supabase URL: ${supabaseUrl}`);

  const { error } = await supabase.rpc("exec_sql", { sql_query: sql });

  if (error) {
    console.error("Migration failed via RPC, trying direct REST...");
    console.error(error.message);

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql_query: sql }),
    });

    if (!response.ok) {
      console.error("Direct REST also failed:", await response.text());
      process.exit(1);
    }
  }

  console.log("Migration completed successfully!");
}

runMigration().catch(console.error);
