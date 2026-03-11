import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

import * as schema from "./schema";

async function seedUsers() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required.");
    process.exit(1);
  }

  const db = drizzle(databaseUrl, { schema });

  const usersToSeed = [
    {
      email: "relawan@example.com",
      password: "password123",
      name: "Relawan User",
      role: "relawan",
      verified: true,
      emailVerified: true,
    },
    {
      email: "perangkat_desa@example.com",
      password: "password123",
      name: "Perangkat Desa User",
      role: "perangkat_desa",
      verified: true,
      emailVerified: true,
    },
  ];

  console.log("Seeding relawan and perangkat desa users...");

  for (const userData of usersToSeed) {
    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, userData.email))
      .limit(1);

    if (existingUsers.length > 0) {
      console.log(`User ${userData.email} already exists. Skipping.`);
      continue;
    }

    // Hash password using better-auth's built-in hasher
    const hashedPassword = await hashPassword(userData.password);

    // Generate a unique ID
    const userId = crypto.randomUUID();

    // Create the user
    await db.insert(schema.user).values({
      id: userId,
      name: userData.name,
      email: userData.email,
      emailVerified: userData.emailVerified,
      role: userData.role,
      verified: userData.verified,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create the credential account
    await db.insert(schema.account).values({
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`User created successfully: ${userData.email} (${userData.role})`);
  }

  process.exit(0);
}

seedUsers().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
