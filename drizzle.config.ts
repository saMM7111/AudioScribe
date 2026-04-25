import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
  },
});
