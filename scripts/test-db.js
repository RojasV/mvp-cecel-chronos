const { Client } = require("pg");

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
    const res = await client.query("SELECT version()");
    console.log("Version:", res.rows[0].version.substring(0, 80));
    await client.end();
  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
