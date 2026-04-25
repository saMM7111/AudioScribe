import postgres from "postgres";

const url = "postgresql://admin:password123@localhost:5433/audio_transcriber";
console.log("Connecting to:", url);

const sql = postgres(url);

async function test() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log("✅ Connection successful:", result);
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
  process.exit(0);
}

test();
