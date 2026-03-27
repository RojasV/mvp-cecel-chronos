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
    console.log("Connected to Supabase Postgres!");

    const schemaPath = path.resolve(__dirname, "../docs/schema.sql");
    let sql = fs.readFileSync(schemaPath, "utf-8");

    // Make CREATE TABLE idempotent
    sql = sql.replace(/CREATE TABLE (\w+)/g, "CREATE TABLE IF NOT EXISTS $1");
    // Make CREATE INDEX idempotent
    sql = sql.replace(/CREATE INDEX (\w+)/g, "CREATE INDEX IF NOT EXISTS $1");

    // Split into individual statements, handling DO $$ blocks
    const statements = [];
    let current = "";
    let inDollarBlock = false;

    for (const line of sql.split("\n")) {
      const trimmed = line.trim();

      // Skip pure comments
      if (trimmed.startsWith("--") && !inDollarBlock) {
        continue;
      }

      current += line + "\n";

      if (trimmed.includes("$$") && !trimmed.startsWith("--")) {
        const count = (trimmed.match(/\$\$/g) || []).length;
        if (count % 2 === 1) {
          inDollarBlock = !inDollarBlock;
        }
      }

      if (!inDollarBlock && trimmed.endsWith(";")) {
        const stmt = current.trim();
        if (stmt.length > 1) {
          statements.push(stmt);
        }
        current = "";
      }
    }

    if (current.trim().length > 1) {
      statements.push(current.trim());
    }

    console.log(`Found ${statements.length} SQL statements to execute`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
        success++;
      } catch (e) {
        const msg = e.message;
        if (
          msg.includes("already exists") ||
          msg.includes("duplicate key") ||
          msg.includes("already an object")
        ) {
          skipped++;
        } else {
          failed++;
          const preview = stmt.substring(0, 80).replace(/\n/g, " ");
          console.error(`[${i + 1}] FAILED: ${preview}...`);
          console.error(`    Error: ${msg}`);
        }
      }
    }

    console.log(`\nResults: ${success} ok, ${skipped} skipped (already exist), ${failed} failed`);

    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log("\nPublic tables:");
    res.rows.forEach((r) => console.log("  -", r.table_name));

    await client.end();
  } catch (e) {
    console.error("Fatal error:", e.message);
    await client.end();
    process.exit(1);
  }
}

run();
