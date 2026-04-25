import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";
import { user } from "../src/lib/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Checking if admin user exists...");
  
  const existingAdmin = await db.select().from(user).where(eq(user.username, "admin")).limit(1);

  if (existingAdmin.length > 0) {
    console.log("Admin user already exists. Skipping seed.");
    process.exit(0);
  }

  console.log("Creating admin user...");
  try {
    await auth.api.signUpEmail({
      body: {
        email: "admin@local.host", // email is required by default better-auth, even if we use username plugin, wait we can configure it
        password: "Admin@1234",
        name: "Admin",
        username: "admin"
      }
    });
    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Failed to create admin user:", error);
    process.exit(1);
  }
  process.exit(0);
}

seed();
