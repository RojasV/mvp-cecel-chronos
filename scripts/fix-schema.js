const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function run() {
  const client = new Client({
    host: "aws-1-us-east-1.pooler.supabase.com",
    port: 5432,
    database: "postgres",
    user: "postgres.slfgrqlavepinggbirfj",
    password: "Vcd123vlad$$$",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected!");

    // Drop the failed chronos.profiles table
    await client.query("DROP TABLE IF EXISTS chronos.profiles CASCADE");

    // Read schema, adapt for chronos schema
    const schemaPath = path.resolve(__dirname, "../docs/schema.sql");
    let sql = fs.readFileSync(schemaPath, "utf-8");

    // Replace uuid_generate_v4() with gen_random_uuid() (native PG 13+)
    sql = sql.replace(/uuid_generate_v4\(\)/g, "gen_random_uuid()");

    // Remove CREATE EXTENSION lines (already in public)
    sql = sql.replace(/CREATE EXTENSION.*?;\n/g, "");

    // Make CREATE TABLE idempotent
    sql = sql.replace(/CREATE TABLE (\w+)/g, "CREATE TABLE IF NOT EXISTS $1");
    sql = sql.replace(/CREATE INDEX (\w+)/g, "CREATE INDEX IF NOT EXISTS $1");

    // Prepend SET search_path
    sql = "SET search_path TO chronos, public;\n\n" + sql;

    // Split into statements
    const statements = [];
    let current = "";
    let inDollarBlock = false;

    for (const line of sql.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("--") && !inDollarBlock) continue;
      current += line + "\n";

      if (trimmed.includes("$$") && !trimmed.startsWith("--")) {
        const count = (trimmed.match(/\$\$/g) || []).length;
        if (count % 2 === 1) inDollarBlock = !inDollarBlock;
      }

      if (!inDollarBlock && trimmed.endsWith(";")) {
        const stmt = current.trim();
        if (stmt.length > 1) statements.push(stmt);
        current = "";
      }
    }
    if (current.trim().length > 1) statements.push(current.trim());

    console.log(`Running ${statements.length} statements in chronos schema...`);

    let success = 0, skipped = 0, failed = 0;

    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i]);
        success++;
      } catch (e) {
        const msg = e.message;
        if (msg.includes("already exists") || msg.includes("duplicate")) {
          skipped++;
        } else {
          failed++;
          const preview = statements[i].substring(0, 100).replace(/\n/g, " ");
          console.error(`  [${i + 1}] ${msg.substring(0, 80)}`);
          console.error(`      ${preview}`);
        }
      }
    }

    console.log(`\nResults: ${success} ok, ${skipped} skipped, ${failed} failed`);

    // Verify
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'chronos' ORDER BY table_name
    `);
    console.log("\nTables in chronos:");
    res.rows.forEach((r) => console.log("  -", r.table_name));

    // Grants
    await client.query("GRANT USAGE ON SCHEMA chronos TO anon, authenticated");
    await client.query("GRANT ALL ON ALL TABLES IN SCHEMA chronos TO anon, authenticated");
    await client.query("GRANT ALL ON ALL SEQUENCES IN SCHEMA chronos TO anon, authenticated");
    await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA chronos GRANT ALL ON TABLES TO anon, authenticated");
    await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA chronos GRANT ALL ON SEQUENCES TO anon, authenticated");
    console.log("\nGrants applied!");

    await client.end();
    console.log("Done!");
  } catch (e) {
    console.error("Fatal:", e.message);
    await client.end();
    process.exit(1);
  }
}

run();
